const connection = require('../config/oracle.config');

const createCollectionProfilesTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE collection_profiles (
        collection_id VARCHAR2(50) REFERENCES collections(id) ON DELETE CASCADE,
        profil_id VARCHAR2(50) REFERENCES profiles(id) ON DELETE CASCADE,
        PRIMARY KEY (collection_id, profil_id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "collection_profiles" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "collection_profiles" already exists.');
    else console.error('Error creating junction table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createCollectionProfilesTable };