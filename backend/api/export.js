const express = require('express');
const { Client } = require('pg'); // or mysql2 if using MySQL
const router = express.Router();
const { Parser } = require('json2csv'); // For CSV conversion

// Database connection (ensure this matches your setup)
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Use SSL for secure connection
});

client.connect();

router.get('/', async (req, res) => {
  try {
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