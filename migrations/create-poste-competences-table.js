const connection = require('../config/oracle.config');

const createPosteCompetencesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE poste_competences (
        poste_id VARCHAR2(50) REFERENCES postes(id) ON DELETE CASCADE,
        competence_id VARCHAR2(50) REFERENCES competences(id) ON DELETE CASCADE,
        PRIMARY KEY (poste_id, competence_id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "poste_competences" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "poste_competences" already exists.');
    else console.error('Error creating junction table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createPosteCompetencesTable };