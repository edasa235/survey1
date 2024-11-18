import express from 'express';
import pkg from 'pg';
import { Parser } from 'json2csv'; // For CSV conversion

const router = express.Router();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Allow insecure SSL certificates (useful for hosted services like Render)
  }
});

// Helper function to get a database connection
async function getConnection() {
  return pool.connect();
}

router.get('/', async (req, res) => {
  try {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM answers'); // Adjust table name and query as needed
    const data = result.rows;

    // Convert data to CSV
    const json2csv = new Parser();
    const csv = json2csv.parse(data);

    // Send the CSV file as a response
    res.header('Content-Type', 'text/csv');
    res.attachment('survey_answers.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error exporting data');
  }
});

export default router;
