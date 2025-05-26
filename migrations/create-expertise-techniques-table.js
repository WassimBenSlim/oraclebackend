const connection = require('../config/oracle.config');

const createExpertiseTechniquesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE expertise_techniques (
        id VARCHAR2(50) PRIMARY KEY,
        expertiseName VARCHAR2(100) NOT NULL UNIQUE,
        expertiseName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "expertise_techniques" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "expertise_techniques" already exists.');
    else console.error('Error creating "expertise_techniques" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createExpertiseTechniquesTable };