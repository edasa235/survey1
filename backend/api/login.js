import express from 'express';
import bcrypt from 'bcrypt';
import { getConnection } from './db.js';
import validator from 'validator';

const router = express.Router();

// Login route
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
		const client = await getConnection();
		const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
		client.release();

		if (result.rows.length > 0) {
			const user = result.rows[0];
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				res.status(200).json({ user_id: user.user_id });
			} else {
				res.status(401).json({ error: 'Invalid username or password' });
			}
		} else {
			res.status(401).json({ error: 'Invalid username or password' });
		}
	} catch (error) {
		console.error('Login Error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
});

export default router;
