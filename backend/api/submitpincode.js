import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 3000), // Convert DB_PORT to a number
  ssl: {
    rejectUnauthorized: false, // Allow insecure SSL certificates (useful for hosted services like Render)
  }
});

const router = express.Router();

// Helper function to get a database connection
async function getConnection() {
  return pool.connect();
}

// Route to validate an existing pincode
router.post('/', async (req, res) => {
  const { genpincode } = req.body;

  if (!genpincode || genpincode.length !== 4 || isNaN(genpincode)) {
    return res.status(400).json({ error: "Invalid pincode format. Must be a 4-digit number." });
  }

  try {
    const client = await getConnection();
    const query = 'SELECT * FROM survey_pincodes WHERE pincode = $1';
    const result = await client.query(query, [genpincode]);
    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: "Pincode is valid" });
    } else {
      res.status(401).json({ error: "Invalid pincode" });
    }
  } catch (error) {
    console.error("Error validating pincode")
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
