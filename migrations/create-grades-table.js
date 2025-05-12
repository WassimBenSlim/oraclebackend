const connection = require('../config/oracle.config');

const createGradesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE grades (
        id VARCHAR2(50) PRIMARY KEY,
        gradeName VARCHAR2(100) NOT NULL UNIQUE,
        gradeName_en VARCHAR2(100) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "grades" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "grades" already exists.');
    else console.error('Error creating "grades" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createGradesTable };