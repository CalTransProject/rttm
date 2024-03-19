// server/database/config.js
require('dotenv').config({ path: './database/db.env' });



console.log("Environment Variables:");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_PORT:", process.env.DB_PORT);

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, // This should now correctly reflect the environment variable
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
