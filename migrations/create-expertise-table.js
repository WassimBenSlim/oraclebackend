const connection = require('../config/oracle.config');

const createExpertiseTables = async () => {
  let conn;
  try {
    conn = await connection();
    
    await conn.execute(`
      CREATE TABLE expertise_metiers (
        id VARCHAR2(50) PRIMARY KEY,
        expertiseName VARCHAR2(100) NOT NULL UNIQUE,
        expertiseName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE expertise_techniques (
        id VARCHAR2(50) PRIMARY KEY,
        expertiseName VARCHAR2(100) NOT NULL UNIQUE,
        expertiseName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE expertise_logicielles (
        id VARCHAR2(50) PRIMARY KEY,
        expertiseName VARCHAR2(100) NOT NULL UNIQUE,
        expertiseName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE competences (
        id VARCHAR2(50) PRIMARY KEY,
        competenceName VARCHAR2(100) NOT NULL UNIQUE,
        competenceName_en VARCHAR2(100) NOT NULL UNIQUE,
        active NUMBER(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Expertise tables created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Expertise tables already exist.');
    else console.error('Error creating expertise tables:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createExpertiseTables };