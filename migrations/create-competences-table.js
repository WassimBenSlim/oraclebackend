const connection = require('../config/oracle.config');

const createCompetencesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE competences (
        id VARCHAR2(50) PRIMARY KEY,
        competenceName VARCHAR2(100) NOT NULL UNIQUE,
        competenceName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "competences" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "competences" already exists.');
    else console.error('Error creating "competences" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createCompetencesTable };