const connection = require("../config/oracle.config")

const createSavedFiltersIndexes = async () => {
  let conn
  try {
    conn = await connection()

    // Create indexes for better performance
    const indexes = [
      "CREATE INDEX idx_saved_filters_creator ON saved_filters(creator_id)",
      "CREATE INDEX idx_saved_filters_name ON saved_filters(filterName)",
      "CREATE INDEX idx_saved_filters_created ON saved_filters(createdAt)",
    ]

    for (const indexSql of indexes) {
      try {
        await conn.execute(indexSql)
        console.log(`Index created: ${indexSql.split(" ")[2]}`)
      } catch (err) {
        if (err.errorNum === 955) {
          console.log(`Index already exists: ${indexSql.split(" ")[2]}`)
        } else {
          console.error(`Error creating index: ${err.message}`)
        }
      }
    }
  } catch (err) {
    console.error("Error creating saved_filters indexes:", err.message)
  } finally {
    if (conn) await conn.close()
  }
}

module.exports = { createSavedFiltersIndexes }
