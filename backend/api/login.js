import express from 'express';
import bcrypt from 'bcrypt';
import { getConnection } from './db.js';
import * as app from '@sanity/client/src/csm/studioPath.js' // Corrected import

const router = express.Router();

router.post('/', async (req, res) => {
	const { username, password } = req.body;

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
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

export default router;
