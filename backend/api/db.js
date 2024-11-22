import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  ssl: { rejectUnauthorized: false },
});

export async function getConnection() {
  return pool.connect();
}

export default pool;
