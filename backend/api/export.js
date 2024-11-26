import express from 'express';
import { json2csv } from 'json-2-csv';
import { getConnection } from './db.js';

const app = express();
app.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

const router = express.Router();

router.get('/', async (req, res) => {
  const client = await getConnection();
  try {
    const result = await client.query('SELECT * FROM answers'); // Replace 'answers' with your actual table name
    const data = result.rows;

    const csv = json2csv(data); // Await conversion to CSV
    res.header('Content-Type', 'text/csv');
    res.attachment('survey_answers.csv');
    res.send(csv);
    console.log('CSV generated:', csv);
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).send('Error exporting data');
  } finally {
    client.release(); // Always release the client
  }
});
app.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

export default router;
