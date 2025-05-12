const connection = require('../config/oracle.config');

const createProfileExpTechniquesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE profile_exp_techniques (
        profile_id VARCHAR2(50) NOT NULL,
        expertise_technique_id VARCHAR2(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (profile_id, expertise_technique_id),
        CONSTRAINT fk_pet_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CONSTRAINT fk_pet_technique FOREIGN KEY (expertise_technique_id) REFERENCES expertise_techniques(id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "profile_exp_techniques" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table already exists.');
    else console.error('Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createProfileExpTechniquesTable };