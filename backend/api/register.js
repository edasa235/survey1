import pkg from 'pg';
import bcrypt from 'bcrypt';
import express from 'express';
import dotenv from 'dotenv'



dotenv.config();

const { Pool } = pkg;
const router = express.Router();

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
console.log('PGHOST:', process.env.PGHOST);
console.log('PGUSER:', process.env.PGUSER);

async function getConnection() {
	return pool.connect();
}

router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { username, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const client = await getConnection();

		// First, insert the user without RETURNING clause
		await client.query(
			'INSERT INTO users (username, password) VALUES ($1, $2);',
			[username, hashedPassword]
		);

		const result = await client.query(
			'SELECT user_id FROM users WHERE username = $1 ORDER BY created_at DESC LIMIT 1;',
			[username]
		);

		client.release();

		if (result.rows && result.rows.length > 0) {
			res.status(201).json({ id: result.rows[0].id, username });
		}
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});

export default router;
