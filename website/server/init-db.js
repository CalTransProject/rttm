// server/init-db.js
const pool = require('./database/config'); // Assuming you've set up your pool

const createTables = `
CREATE TABLE "User" (
  "UserID" SERIAL PRIMARY KEY,
  "Username" VARCHAR(255) NOT NULL UNIQUE,
  "Password" TEXT NOT NULL,
  "Role" TEXT
);
CREATE INDEX "idx_user_username" ON "User" ("Username");
-- Add the rest of your CREATE TABLE and CREATE INDEX statements here
`;

pool.query(createTables, (err, res) => {
  console.log(err, res);
  pool.end();
});