import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Function to establish a database connection
async function getConnection() {
	const dbConfig = {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
	};
	return await mysql.createConnection(dbConfig);
}

// Registration endpoint
router.post('/', async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const connection = await getConnection();

		// Check if username already exists
		const [existingUsers] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
		if (existingUsers.length > 0) {
			await connection.end();
			return res.status(409).json({ error: 'Username already exists' });
		}

		const [result] = await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
		await connection.end();
		res.status(201).json({ user_id: result.insertId, username });
	} catch (error) {
		console.error('Registration Error:', error); // Log the error to the console
		res.status(500).json({ error: 'Registration failed', message: error.message });
	}
});

export default router;
