const connection = require('../config/oracle.config');

const createPosteExpertiseLogiciellesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE poste_expertise_logicielles (
        poste_id VARCHAR2(50) REFERENCES postes(id) ON DELETE CASCADE,
        expertise_logicielle_id VARCHAR2(50) REFERENCES expertise_logicielles(id) ON DELETE CASCADE,
        PRIMARY KEY (poste_id, expertise_logicielle_id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "poste_expertise_logicielles" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "poste_expertise_logicielles" already exists.');
    else console.error('Error creating junction table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createPosteExpertiseLogiciellesTable };