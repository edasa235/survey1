import express from 'express';
import bcrypt from 'bcrypt';
import { getConnection } from './db.js';
import * as app from '@sanity/client/src/csm/studioPath.js' // Corrected import

const router = express.Router();

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
			res.status(201).json({ id: result.rows[0].user_id, username }); // Adjusted to use `user_id` instead of `id`
		}
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

export default router;
