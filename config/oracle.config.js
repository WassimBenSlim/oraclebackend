const oracledb = require('oracledb');
require('dotenv').config();

oracledb.fetchAsString = [oracledb.CLOB];

oracledb.initOracleClient({
  libDir: process.env.ORACLE_CLIENT_LIB_DIR});

const connection = async () => {
    return await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING,
    });
};

module.exports = connection;