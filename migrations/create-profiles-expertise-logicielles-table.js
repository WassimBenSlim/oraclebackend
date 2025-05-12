const connection = require('../config/oracle.config');

const createProfileExpLogiciellesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE profile_exp_logicielles (
        profile_id VARCHAR2(50) NOT NULL,
        expertise_logicielle_id VARCHAR2(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (profile_id, expertise_logicielle_id),
        CONSTRAINT fk_pel_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CONSTRAINT fk_pel_logicielle FOREIGN KEY (expertise_logicielle_id) REFERENCES expertise_logicielles(id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "profile_exp_logicielles" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table already exists.');
    else console.error('Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createProfileExpLogiciellesTable };