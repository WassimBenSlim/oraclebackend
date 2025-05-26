const connection = require('../config/oracle.config');

const createExpertiseLogiciellesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE expertise_logicielles (
        id VARCHAR2(50) PRIMARY KEY,
        expertiseName VARCHAR2(100) NOT NULL UNIQUE,
        expertiseName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(sql);
    console.log('Table "expertise_logicielles" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "expertise_logicielles" already exists.');
    else console.error('Error creating "expertise_logicielles" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createExpertiseLogiciellesTable };