const connection = require("../config/oracle.config")
const { v4: uuidv4 } = require("uuid")

// GET /filter/getAllFilters - Get all saved filters
const getAllFilters = async (req, res, next) => {
  let conn
  try {
    conn = await connection()

    const query = `
      SELECT 
        id,
        filterName,
        filterData,
        createdAt,
        updatedAt,
        creator_id
      FROM saved_filters 
      ORDER BY createdAt DESC
    `

    const result = await conn.execute(query)

    if (result.rows.length === 0) {
      return res.status(204).json({ message: "No filters found" })
    }

    const filters = result.rows.map((row) => ({
      _id: row[0],
      filterName: row[1],
      filter: JSON.parse(row[2] || "{}"), // Parse the JSON filter data
      createdAt: row[3],
      updatedAt: row[4],
      creator_id: row[5],
    }))

    res.json({
      success: true,
      filters,
    })
  } catch (error) {
    console.error("Error getting all filters:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// POST /filter/create - Create new filter (FIXED to prevent duplicate calls)
const createFilter = async (req, res, next) => {
  let conn
  try {
    const { filterName, filterData } = req.body
    const creatorId = req.user?.id

    console.log("Create filter request:", {
      filterName,
      filterDataType: typeof filterData,
      creatorId,
    })

    if (!filterName) {
      return res.status(400).json({ error: "Filter name is required" })
    }

    if (!creatorId) {
      return res.status(401).json({ error: "User not authenticated" })
    }

    conn = await connection()

    const filterId = uuidv4()
    const filterDataString = JSON.stringify(filterData || {})

    console.log("Inserting filter with:", {
      id: filterId,
      filterName,
      filterDataLength: filterDataString.length,
      creatorId,
    })

    // Use proper named binding with simple values
    const result = await conn.execute(
      `INSERT INTO saved_filters (id, filterName, filterData, creator_id, createdAt, updatedAt) 
       VALUES (:id, :filterName, :filterData, :creatorId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      {
        id: filterId,
        filterName: filterName,
        filterData: filterDataString,
        creatorId: creatorId,
      },
      { autoCommit: true },
    )

    console.log("Filter created successfully:", result.rowsAffected)

    // Send response immediately and return to prevent duplicate processing
    res.status(201).json({
      success: true,
      message: "Filter created successfully",
      filterId,
      filter: {
        _id: filterId,
        filterName,
        filter: filterData || {},
        creator_id: creatorId,
      },
    })

    return // Prevent any further processing
  } catch (error) {
    console.error("Error creating filter:", error)

    // Only send response if not already sent
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      })
    }
  } finally {
    if (conn) await conn.close()
  }
}

// DELETE /filter/delete/:id - Delete filter
const deleteFilter = async (req, res, next) => {
  let conn
  try {
    const filterId = req.params.id

    conn = await connection()

    const result = await conn.execute(
      `DELETE FROM saved_filters WHERE id = :filterId`,
      { filterId: filterId },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Filter not found" })
    }

    res.json({
      success: true,
      message: "Filter deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting filter:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// PUT /filter/update/:id - Update filter
const updateFilter = async (req, res, next) => {
  let conn
  try {
    const filterId = req.params.id
    const { filterName, filterData } = req.body

    if (!filterName) {
      return res.status(400).json({ error: "Filter name is required" })
    }

    conn = await connection()

    const filterDataString = JSON.stringify(filterData || {})

    const result = await conn.execute(
      `UPDATE saved_filters 
       SET filterName = :filterName, 
           filterData = :filterData, 
           updatedAt = CURRENT_TIMESTAMP 
       WHERE id = :filterId`,
      {
        filterName: filterName,
        filterData: filterDataString,
        filterId: filterId,
      },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Filter not found" })
    }

    res.json({
      success: true,
      message: "Filter updated successfully",
    })
  } catch (error) {
    console.error("Error updating filter:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// GET /filter/:id - Get single filter by ID
const getFilterById = async (req, res, next) => {
  let conn
  try {
    const filterId = req.params.id

    conn = await connection()

    const result = await conn.execute(
      `SELECT id, filterName, filterData, createdAt, updatedAt, creator_id
       FROM saved_filters 
       WHERE id = :filterId`,
      { filterId: filterId },
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Filter not found" })
    }

    const row = result.rows[0]
    const filter = {
      _id: row[0],
      filterName: row[1],
      filter: JSON.parse(row[2] || "{}"),
      createdAt: row[3],
      updatedAt: row[4],
      creator_id: row[5],
    }

    res.json({
      success: true,
      filter,
    })
  } catch (error) {
    console.error("Error getting filter by ID:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// POST /filter/apply - Main endpoint the frontend is calling
const applyFilter = async (req, res, next) => {
  let conn
  try {
    const {
      grade = [],
      poste = "",
      competences = [],
      expMetiers = [],
      expLogicielles = [],
      expTechniques = [],
      search = "",
      active = true,
      offset = 0,
    } = req.body

    conn = await connection()

    let query = `
      SELECT DISTINCT
        p.id as profile_id,
        u.id as user_id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.flag,
        g.gradeName,
        pos.posteName
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN postes pos ON p.poste_id = pos.id
      WHERE u.flag = :activeFlag
    `

    const binds = { activeFlag: active ? 1 : 0 }
    let bindCounter = 1

    if (search) {
      query += ` AND (LOWER(u.nom) LIKE :search${bindCounter} OR LOWER(u.prenom) LIKE :search${bindCounter})`
      binds[`search${bindCounter}`] = `%${search.toLowerCase()}%`
      bindCounter++
    }

    if (grade.length > 0) {
      const gradePlaceholders = grade.map((_, index) => `:grade${bindCounter + index}`).join(",")
      query += ` AND g.id IN (${gradePlaceholders})`
      grade.forEach((g, index) => {
        binds[`grade${bindCounter + index}`] = g.value || g._id || g
      })
      bindCounter += grade.length
    }

    if (poste) {
      query += ` AND pos.posteName = :poste${bindCounter}`
      binds[`poste${bindCounter}`] = poste
      bindCounter++
    }

    const countQuery = query.replace(/SELECT DISTINCT.*?FROM/, "SELECT COUNT(DISTINCT p.id) as total FROM")
    const countResult = await conn.execute(countQuery, binds)
    const totalCount = countResult.rows[0][0]

    query += ` ORDER BY u.nom, u.prenom OFFSET :offset ROWS FETCH NEXT 20 ROWS ONLY`
    binds.offset = offset * 20

    const result = await conn.execute(query, binds)

    const profiles = result.rows.map((row) => ({
      _id: row[0],
      user: {
        email: row[4],
        nom: row[2],
        prenom: row[3],
        telephone: row[5],
        flag: row[6] === 1,
      },
      grade: {
        gradeName: row[7],
      },
      poste: {
        name: row[8],
      },
    }))

    res.json({
      profiles,
      countDocs: totalCount,
    })
  } catch (error) {
    console.error("Error in filter/apply:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// GET /filter/archived - Endpoint for getting archived profiles
const getArchivedProfiles = async (req, res, next) => {
  let conn
  try {
    const { search = "", offset = 0 } = req.body

    conn = await connection()

    let query = `
      SELECT DISTINCT
        p.id as profile_id,
        u.id as user_id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.flag,
        g.gradeName,
        pos.posteName
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN postes pos ON p.poste_id = pos.id
      WHERE u.flag = 0
    `

    const binds = {}

    if (search) {
      query += ` AND (LOWER(u.nom) LIKE :search OR LOWER(u.prenom) LIKE :search)`
      binds.search = `%${search.toLowerCase()}%`
    }

    const countQuery = query.replace(/SELECT DISTINCT.*?FROM/, "SELECT COUNT(DISTINCT p.id) as total FROM")
    const countResult = await conn.execute(countQuery, binds)
    const totalCount = countResult.rows[0][0]

    query += ` ORDER BY u.nom, u.prenom OFFSET :offset ROWS FETCH NEXT 20 ROWS ONLY`
    binds.offset = offset * 20

    const result = await conn.execute(query, binds)

    const profiles = result.rows.map((row) => ({
      _id: row[0],
      user: {
        email: row[4],
        nom: row[2],
        prenom: row[3],
        telephone: row[5],
        flag: row[6] === 1,
      },
      grade: {
        gradeName: row[7],
      },
      poste: {
        name: row[8],
      },
    }))

    res.json({
      profiles,
      countDocs: totalCount,
    })
  } catch (error) {
    console.error("Error getting archived profiles:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// POST /filter/restore/:id - Endpoint for restoring a profile
const restoreProfile = async (req, res, next) => {
  let conn
  try {
    const profileId = req.params.id

    conn = await connection()

    const result = await conn.execute(
      `UPDATE users SET flag = 1, updatedAt = CURRENT_TIMESTAMP 
             WHERE id = (SELECT user_id FROM profiles WHERE id = :profileId)`,
      { profileId: profileId },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json({ message: "Profile restored successfully" })
  } catch (error) {
    console.error("Error restoring profile:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

module.exports = {
  getAllFilters,
  createFilter,
  deleteFilter,
  updateFilter,
  getFilterById,
  applyFilter,
  getArchivedProfiles,
  restoreProfile,
}
