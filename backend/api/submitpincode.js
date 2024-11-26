import express from 'express';
import { getConnection } from './db.js';
import * as app from '@sanity/client/src/csm/studioPath.js'

const router = express.Router();

router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Generate a random 4-digit pincode (between 1000 and 9999)
    const generatedPincode = Math.floor(1000 + Math.random() * 9000);
    console.log(`Generated pincode: ${generatedPincode}`);

    const client = await getConnection();

    // Insert the generated pincode into the database
    await client.query(
      'INSERT INTO survey_pincodes (pincode) VALUES ($1);',
      [generatedPincode]
    );

    client.release(); // Always release the client

    // Respond with the generated pincode for the admin to distribute
    res.status(201).json({
      message: 'Pincode generated successfully',
      generatedPincode: generatedPincode,
    });
  } catch (error) {
    console.error("Error generating pincode:", error);
    res.status(500).json({ error: 'Failed to generate pincode' });
  }
});
app.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

export default router;
