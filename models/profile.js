const connection = require("../config/oracle.config")
const oracledb = require("oracledb")

module.exports.createProfile = async (profileData) => {
  const conn = await connection()
  try {
    // Convert string 'null' to actual null for database insertion for foreign keys
    const poste_id = profileData.poste_id === "null" ? null : profileData.poste_id
    const grade_id = profileData.grade_id === "null" ? null : profileData.grade_id
    const metier_id = profileData.metier_id === "null" ? null : profileData.metier_id

    // Handle experienceYears and description similarly
    const experienceYears = profileData.experienceYears === "null" ? null : profileData.experienceYears
    const description = profileData.description === "undefined" ? null : profileData.description

    if (experienceYears !== null && isNaN(Number(experienceYears))) throw new Error("Invalid experienceYears value")

    const dataToInsert = {
      ...profileData,
      experienceYears,
      poste_id,
      grade_id,
      metier_id,
      description, // Use the cleaned description
    }

    const insertSQL = `
      INSERT INTO profiles (
        id, user_id, cvLanguage, description, experienceYears,
        langues, formations, formations_en,
        expSignificatives, expSignificatives_en,
        poste_id, grade_id, metier_id, images,
        createdAt, updatedAt
      ) VALUES (
        :id, :user_id, :cvLanguage, :description, :experienceYears,
        :langues, :formations, :formations_en,
        :expSignificatives, :expSignificatives_en,
        :poste_id, :grade_id, :metier_id, :images,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `
    await conn.execute(insertSQL, dataToInsert)
    await conn.commit()
  } catch (err) {
    throw err
  } finally {
    await conn.close()
  }
}

module.exports.getProfileByUserId = async (userId) => {
  const conn = await connection()
  try {
    const result = await conn.execute(
      `SELECT 
        p.*, 
        g.id as GRADE_ID, g.gradeName as GRADE_NAME, g.gradeName_en as GRADE_NAME_EN,
        m.id as METIER_ID, m.metierName as METIER_NAME, m.metierName_en as METIER_NAME_EN,
        pos.id as POSTE_ID, pos.posteName as POSTE_NAME, pos.posteName_en as POSTE_NAME_EN
      FROM profiles p
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN metiers m ON p.metier_id = m.id
      LEFT JOIN postes pos ON p.poste_id = pos.id
      WHERE p.user_id = :userId`,
      { userId },
      { outFormat: oracledb.OBJECT }
    )
    return result.rows[0]
  } finally {
    await conn.close()
  }
}

module.exports.getProfileById = async (id) => {
  const conn = await connection()
  try {
    const result = await conn.execute(`SELECT * FROM profiles WHERE id = :id`, { id }, { outFormat: oracledb.OBJECT })
    return result.rows[0]
  } finally {
    await conn.close()
  }
}

module.exports.updateProfile = async (id, profileData) => {
  const conn = await connection()
  try {
    // Convert string 'null' to actual null for database insertion for foreign keys
    const poste_id = profileData.poste_id === "null" ? null : profileData.poste_id
    const grade_id = profileData.grade_id === "null" ? null : profileData.grade_id
    const metier_id = profileData.metier_id === "null" ? null : profileData.metier_id
    const experienceYears = profileData.experienceYears === "null" ? null : profileData.experienceYears
    const description = profileData.description === "undefined" ? null : profileData.description

    const dataToUpdate = {
      ...profileData,
      experienceYears,
      poste_id,
      grade_id,
      metier_id,
      description,
      id, // Ensure ID is included for the WHERE clause
    }

    const updateSQL = `
      UPDATE profiles SET
        cvLanguage = :cvLanguage,
        description = :description,
        experienceYears = :experienceYears,
        langues = :langues,
        formations = :formations,
        formations_en = :formations_en,
        expSignificatives = :expSignificatives,
        expSignificatives_en = :expSignificatives_en,
        poste_id = :poste_id,
        grade_id = :grade_id,
        metier_id = :metier_id,
        images = :images,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `
    const result = await conn.execute(updateSQL, dataToUpdate) // Use dataToUpdate
    await conn.commit()
    return result.rowsAffected > 0
  } catch (err) {
    throw err
  } finally {
    await conn.close()
  }
}

module.exports.deleteProfile = async (id) => {
  const conn = await connection()
  try {
    const deleteSQL = "DELETE FROM profiles WHERE id = :id"
    const result = await conn.execute(deleteSQL, { id })
    await conn.commit()
    return result.rowsAffected > 0
  } finally {
    await conn.close()
  }
}

module.exports.getProfilesWithName = async (search) => {
  const conn = await connection()
  try {
    let query = `
      SELECT
        p.id,
        p.user_id,
        u.nom,
        u.prenom,
        u.email,
        g.gradeName as grade_name,
        m.metierName as metier_name
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN metiers m ON p.metier_id = m.id
    `

    const params = {}
    if (search) {
      query += ` WHERE UPPER(u.nom) LIKE UPPER(:search) OR UPPER(u.prenom) LIKE UPPER(:search)`
      params.search = `%${search}%`
    }

    const result = await conn.execute(query, params, { outFormat: oracledb.OBJECT })

    return result.rows.map((row) => ({
      id: row.ID,
      user: {
        id: row.USER_ID,
        nom: row.NOM,
        prenom: row.PRENOM,
        email: row.EMAIL,
      },
      grade: row.GRADE_NAME ? { name: row.GRADE_NAME } : null,
      metier: row.METIER_NAME ? { name: row.METIER_NAME } : null,
    }))
  } finally {
    await conn.close()
  }
}
