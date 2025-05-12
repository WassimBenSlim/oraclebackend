const connection = require('../config/oracle.config');

const createPostesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE postes (
        id VARCHAR2(50) PRIMARY KEY,
        posteName VARCHAR2(100) NOT NULL UNIQUE,
        posteName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "postes" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "postes" already exists.');
    else console.error('Error creating "postes" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createPostesTable };