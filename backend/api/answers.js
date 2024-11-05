import mysql from 'mysql2/promise';
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

// Answers endpoint
router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { responses, user_id } = req.body;

	try {
		const connection = await getConnection();

		// Store answers in MySQL
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await connection.execute(
				'INSERT INTO answers (user_id, question_id, answer_text) VALUES (?, ?, ?)',
				[user_id, questionId, answerText]
			);
		}

		await connection.end();
		res.status(201).json({ message: 'Answers stored successfully' });
	} catch (error) {
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answers' });
	}
});
router.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

export default router;