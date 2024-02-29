// server/database/config.js
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Uncomment this if you are using self-signed certificates in development
  // ssl: {
  //   rejectUnauthorized: false,
  // }
});

module.exports = pool;
