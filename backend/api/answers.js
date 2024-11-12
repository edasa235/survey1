import pkg from 'pg';
const { Pool } = pkg;
import { Router } from 'express';

const router = Router();

// PostgreSQL database configuration
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT || 5432, // PostgreSQL default port
};

const pool = new Pool(dbConfig);

// Answers endpoint
router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { responses, user_id } = req.body;

	try {
		// Use PostgreSQL query
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await pool.query(
				'INSERT INTO answers (user_id, question_id, answer_text) VALUES ($1, $2, $3)',
				[user_id, questionId, answerText]
			);
		}

		res.status(201).json({ message: 'Answers stored successfully' });
	} catch (error) {
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answers' });
	}
});

export default router;
