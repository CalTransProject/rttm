const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
  try {
    await client.connect();
    console.log("Connected to the database");

    const initSql = fs.readFileSync(path.join(__dirname, 'init-db.sql')).toString();
    await client.query(initSql);
    console.log("Database initialized");

    // Run migrations here (if you have migration scripts)
    // Example:
    // const migrations = fs.readFileSync(path.join(__dirname, 'migrations.sql')).toString();
    // await client.query(migrations);
    // console.log("Migrations applied");

  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await client.end();
  }
}

runMigrations();
