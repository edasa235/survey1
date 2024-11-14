import express from 'express';


import pkg from 'pg';
const {Pool} = pkg;

const app = express(); // Create an Express instance
app.use(express.json()); // Add JSON middleware
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  DP_PORT: process.env.DB_PORT,
});

async function getConnection() {
  return pool.connect();
}
const router = express.Router();

router.post('/', async (req, res) => {
  console.log("Received a request on / route");

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Generate a random 4-digit pincode (between 1000 and 9999)
    const generatedPincode = Math.floor(1000 + Math.random() * 9000);
    console.log(`Generated pincode: ${generatedPincode}`);

    // Insert the generated pincode into the database
    await pool.query(
      'INSERT INTO survey_pincodes (pincode) VALUES ($1);',
      [generatedPincode]
    );

    // Respond with the generated pincode for the admin to distribute
    res.status(201).json({
      message: 'Pincode generated successfully',
      generatedPincode: generatedPincode
    });
  } catch (error) {
    console.error("Error generating pincode:", error);
    res.status(500).json({ error: 'Failed to generate pincode' });
  }
});

export default router;
