import pg from 'pg';
const { Pool } = pg; // Destructure Pool from the pg object

import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }, // Ensure SSL is configured correctly
});

// Exporting the pool object
export default pool;
console.log(pool)
// Async function to get a connection
export async function getConnection() {
  return pool.connect();
}
