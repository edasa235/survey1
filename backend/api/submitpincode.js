import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // corrected from DP_PORT to port
});

async function getConnection() {
  return pool.connect();
}

const router = express.Router();

// Route to validate an existing pincode
router.post('/', async (req, res) => {
  const { genpincode } = req.body;
  try {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM survey_pincodes WHERE pincode = $1', [genpincode]);
    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Pincode is valid' });
    } else {
      res.status(401).json({ error: 'Invalid pincode' });
    }
  } catch (error) {
    console.error("Error validating pincode:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
