import express from 'express';
import pkg from 'pg';
import { json2csv } from 'json-2-csv';

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT), // Convert port to number
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getConnection() {
  return pool.connect();
}

router.get('/', async (req, res) => {
  const client = await getConnection();
  try {
    const result = await client.query('SELECT * FROM answers'); // Replace 'answers' with your actual table name
    const data = result.rows;

    const csv = json2csv(data); // Properly convert to CSV
    res.header('Content-Type', 'text/csv');
    res.attachment('survey_answers.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).send('Error exporting data');
  } finally {
    client.release();
  }
});

export default router;
