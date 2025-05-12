const connection = require('./config/oracle.config');


(async () => {
  try {
    const conn = await connection();
    console.log('Connection successful!');
    await conn.close(); 
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
})();