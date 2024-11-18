import express from 'express';
import pkg from 'pg';
import { json2csv } from 'json-2-csv'; // Correct CSV conversion

const router = express.Router();
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 3000), // Convert DB_PORT to a number
  ssl: {
    rejectUnauthorized: false,
  },
});


// Helper function to get a database connection
async function getConnection() {
  return pool.connect();
}

router.get('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const client = await getConnection();
  try {
    const result = await client.query('SELECT * FROM answers'); // Adjust table name and query as needed
    const data = result.rows;

    // Convert data to CSV
    const csv = json2csv(data);

    // Send the CSV file as a response
    res.header('Content-Type', 'text/csv');
    res.attachment('survey_answers.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).send('Error exporting data');
  } finally {
    client.release(); // Release the client
  }
});

export default router;
