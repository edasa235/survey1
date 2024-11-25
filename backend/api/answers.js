import express from 'express';
import { getConnection } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	let { responses, user_id } = req.body;

	// Generate a new UUID if user_id is not provided
	if (!user_id) {
		user_id = uuidv4();
	}

	const client = await getConnection(); // Fetch connection once
	try {
		// Loop through the responses object and insert each answer into the database
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await client.query(
				'INSERT INTO answers (user_id, question_id, answer_text) VALUES ($1, $2, $3)',
				[user_id, questionId, answerText]
			);
		}

		res.status(201).json({ message: 'Answers stored successfully', user_id });
	} catch (error) {
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answers' });
	} finally {
		client.release(); // Always release the client
	}
});

export default router;
