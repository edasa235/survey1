import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { Router } from 'express';

const router = Router();

// MySQL database configuration
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
};

// Function to establish a database connection
async function getConnection() {
	return mysql.createConnection(dbConfig);
}

// Registration endpoint
router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { username, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const connection = await getConnection();
		const [result] = await connection.execute(
			'INSERT INTO users (username, password) VALUES (?, ?)',
			[username, hashedPassword]
		);
		await connection.end();
		res.status(201).json({ user_id: result.insertId, username });
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});

export default router;
