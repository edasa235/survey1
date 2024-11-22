import pkg from 'pg';
const { Pool } = pkg;
import { Router } from 'express';
import dotenv from 'dotenv'



dotenv.config();
const router = Router();

// PostgreSQL database configuration
const dbConfig = {
	host: process.env.PGHOST,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	database: process.env.PGDATABASE,
	port: parseInt(process.env.DB_PORT, 3000), // Convert DB_PORT to a number
	ssl: {
		rejectUnauthorized: false, // This is to allow insecure SSL certificates (useful for services like Render)
	}
};

const pool = new Pool(dbConfig);

// Answers endpoint
router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { responses, user_id } = req.body;

	try {
		// Loop through the responses object and insert each answer into the database
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
