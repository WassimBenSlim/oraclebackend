const connection = require('../config/oracle.config');

const createProfileCompetencesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE profile_competences (
        profile_id VARCHAR2(50) NOT NULL,
        competence_id VARCHAR2(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (profile_id, competence_id),
        CONSTRAINT fk_pc_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CONSTRAINT fk_pc_competence FOREIGN KEY (competence_id) REFERENCES competences(id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "profile_competences" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table already exists.');
    else console.error('Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createProfileCompetencesTable };