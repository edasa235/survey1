import pkg from 'pg'
import bcrypt from 'bcrypt'
import router from './answers.js'

import {password} from 'pg/lib/defaults.js'
const { Pool } = pkg;

const pool = new Pool({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

async function getConnection() {
  return pool.connect();
}

router.post (`/`, async (req, res) => {

  const { genpincode } = req.body;
  try {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM survey_pincodes WHERE pincode = $1', [genpincode]);

    client.release();
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(genpincode, user.generatedPincode);
      if (isMatch) {
        res.status(200).json({ user_id: user.user_id });

      } else {
        res.status(401).json({ error: 'Invalid pincode ' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

export default router;