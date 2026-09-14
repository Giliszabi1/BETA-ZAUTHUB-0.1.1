const config = require("../../config/database.config");
const mysql2 = require('mysql2/promise');

const DB_CONNECT = mysql2.createPool({
    host: config.DB_host,
    port: config.DB_port,
    user: config.DB_user,
    password: config.DB_password,
    database: config.DB_database  
})
module.exports = DB_CONNECT;