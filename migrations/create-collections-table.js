const connection = require('../config/oracle.config');

const createCollectionsTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE collections (
        id VARCHAR2(50) PRIMARY KEY,
        collectionName VARCHAR2(255) NOT NULL UNIQUE,
        creator_id VARCHAR2(50) REFERENCES users(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "collections" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "collections" already exists.');
    else console.error('Error creating "collections" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createCollectionsTable };