const connection = require('../config/oracle.config');

const createProfileExpMetiersTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE profile_exp_metiers (
        profile_id VARCHAR2(50) NOT NULL,
        expertise_metier_id VARCHAR2(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (profile_id, expertise_metier_id),
        CONSTRAINT fk_pem_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CONSTRAINT fk_pem_metier FOREIGN KEY (expertise_metier_id) REFERENCES expertise_metiers(id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "profile_exp_metiers" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table already exists.');
    else console.error('Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createProfileExpMetiersTable };