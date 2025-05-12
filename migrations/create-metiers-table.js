const connection = require('../config/oracle.config');

const createMetiersTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE metiers (
        id VARCHAR2(50) PRIMARY KEY,
        metierName VARCHAR2(100) NOT NULL UNIQUE,
        metierName_en VARCHAR2(100) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "metiers" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "metiers" already exists.');
    else console.error('Error creating "metiers" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createMetiersTable };