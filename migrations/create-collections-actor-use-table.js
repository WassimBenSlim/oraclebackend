const connection = require('../config/oracle.config');

const createCollectionActorsUseTable = async () => {
  let conn;
  try {
    conn = await connection();
    const sql = `
      CREATE TABLE collection_actors_use (
        collection_id VARCHAR2(50) REFERENCES collections(id) ON DELETE CASCADE,
        user_id VARCHAR2(50) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (collection_id, user_id)
      )
    `;
    await conn.execute(sql);
    console.log('Junction table "collection_actors_use" created.');
  } catch (err) {
    if (err.errorNum === 955) console.log('Table "collection_actors_use" already exists.');
    else console.error('Error creating junction table:', err.message);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { createCollectionActorsUseTable };