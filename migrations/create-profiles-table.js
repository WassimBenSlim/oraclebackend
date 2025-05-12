const connection = require('../config/oracle.config');

const createProfilesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE profiles (
        id VARCHAR2(50) PRIMARY KEY,
        user_id VARCHAR2(50) NOT NULL UNIQUE,
        images VARCHAR2(255),
        cvLanguage VARCHAR2(10) DEFAULT 'fr' NOT NULL,
        description VARCHAR2(4000) DEFAULT NULL,
        experienceYears NUMBER,
        poste_id VARCHAR2(50),
        grade_id VARCHAR2(50),
        metier_id VARCHAR2(50),
        langues CLOB DEFAULT '{"FR":false,"IT":false,"EN":false,"DE":false,"ES":false}' NOT NULL,
        formations CLOB DEFAULT '[{"type":"","libelle":""}]' NOT NULL,
        formations_en CLOB DEFAULT '[{"type":"","libelle":""}]' NOT NULL,
        expSignificatives CLOB DEFAULT '[]' NOT NULL,
        expSignificatives_en CLOB DEFAULT '[]' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_profile_poste FOREIGN KEY (poste_id) REFERENCES postes(id),
        CONSTRAINT fk_profile_grade FOREIGN KEY (grade_id) REFERENCES grades(id),
        CONSTRAINT fk_profile_metier FOREIGN KEY (metier_id) REFERENCES metiers(id)
      )
    `;
    await conn.execute(sql);
    console.log('Table "profiles" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "profiles" already exists.');
    else console.error('Error creating "profiles" table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createProfilesTable };