const { Client } = require('pg');
require('dotenv').config({ path: '../server/database/db.env' });

const connectDb = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = new Client({
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                ssl: true,
            });
            await client.connect();

            // Retrieve all records from the PerHourData table
            const res = await client.query('SELECT * FROM PerHourData');
            const data = res.rows;

            await client.end();

            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = connectDb;