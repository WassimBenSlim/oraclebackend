const connection = require('../config/oracle.config');

const createUserTable = async () => {
  let conn;
  try {
    conn = await connection();
    const createTableSQL = `
      CREATE TABLE users (
          id VARCHAR2(50) PRIMARY KEY,
          prenom VARCHAR2(50) NOT NULL,
          nom VARCHAR2(50) NOT NULL,
          email VARCHAR2(100) UNIQUE NOT NULL,
          pays VARCHAR2(50),
          telephone VARCHAR2(20),
          password VARCHAR2(255) NOT NULL,
          type VARCHAR2(20) DEFAULT 'user',
          flag NUMBER(1) DEFAULT 1,
          activationCode VARCHAR2(100),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(createTableSQL);
    console.log('Table "users" created or already exists.');
  } catch (err) {
    if (err.errorNum === 955) {
      console.log('Table "users" already exists.');
    } else {
      console.error('Error creating "users" table:', err.message);
    }
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createUserTable };
