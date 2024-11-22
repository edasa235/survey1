import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv'



dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.DB_PORT, 3000), // Convert DB_PORT to a number
  ssl: {
    rejectUnauthorized: false, // This is to allow insecure SSL certificates (useful for services like Render)
  }
});

const router = express.Router();

// Route to validate an existing pincode
router.post('/', async (req, res) => {
  const { genpincode } = req.body;

  // Validate the format of the pincode
  if (!genpincode || !/^\d{4}$/.test(genpincode)) {
    return res.status(400).json({ error: "Invalid pincode format. Must be a 4-digit number." });
  }

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM survey_pincodes WHERE pincode = $1';
    const result = await client.query(query, [genpincode]);
    client.release();

    if (result.rows.length > 0) {
      return res.status(200).json({ message: "Pincode is valid" });
    } else {
      return res.status(401).json({ error: "Invalid pincode" });
    }
  } catch (error) {
    console.error("Error validating pincode:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
