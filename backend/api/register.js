import express from 'express';
import bcrypt from 'bcrypt';
import { getConnection } from './db.js';
import validator from 'validator';

const router = express.Router();

// Registration route
router.post('/', async (req, res) => {
	const { username, password } = req.body;

	// Validate the username and password
	if (!validator.isAlphanumeric(username) || username.length < 3 || username.length > 20) {
		return res.status(400).json({ error: 'Username must be alphanumeric and between 3 and 20 characters long.' });
	}

	if (!validator.isLength(password, { min: 6 })) {
		return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const client = await getConnection();

		// Insert the user into the database
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
			res.status(201).json({ id: result.rows[0].user_id, username });
		}
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});

export default router;
