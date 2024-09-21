// scriptsServer/database/config.js

import pg from 'pg';  // Default import for CommonJS module
import dotenv from 'dotenv';  // Default import for CommonJS module
dotenv.config();  // Load environment variables from .env file

// Function to handle database connection
const createPool = () => {
  try {
    // Check if DATABASE_URL is present, otherwise throw an error
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined. Please check your environment variables.");
    }

    // Create a new connection pool using the DATABASE_URL
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,  // Set to true if connecting to a remote database with SSL
    });

    // Log successful pool creation
    console.log("Database connection pool created successfully.");

    return pool;
  } catch (error) {
    // Log the error and exit the process with a failure code
    console.error("Error creating database connection pool:", error.message);
    process.exit(1);  // Exit the process with a failure code
  }
};

// Create the database connection pool
const pool = createPool();

// Handle errors on the database pool
pool.on('error', (err, client) => {
  console.error("Unexpected error on idle database client:", err);
  process.exit(-1);
});

// Export the pool to be used in other parts of the application
export default pool;
