require('dotenv').config();

const DB_CONFIG = {
    DB_host: process.env.DATABASE_HOST,
    DB_user: process.env.DATABASE_USER,
    DB_password: process.env.DATABASE_PASSWORD,
    DB_port: process.env.DATABASE_PORT,
    DB_database: process.env.DATABASE_DATABASE
}

module.exports = DB_CONFIG;