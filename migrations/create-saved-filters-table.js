const connection = require("../config/oracle.config")

const createSavedFiltersTable = async () => {
  let conn
  try {
    conn = await connection()
    const sql = `
      CREATE TABLE saved_filters (
        id VARCHAR2(36) PRIMARY KEY,
        filterName VARCHAR2(255) NOT NULL,
        filterData CLOB,
        creator_id VARCHAR2(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_saved_filters_creator 
            FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
    await conn.execute(sql)
    console.log('✅ Table "saved_filters" created with proper CLOB structure')
  } catch (err) {
    if (err.errorNum === 955) {
      console.log('Table "saved_filters" already exists.');
    } else {
      console.error('Error creating "saved_filters" table:', err.message);
    }
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createSavedFiltersTable }
