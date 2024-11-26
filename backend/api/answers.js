import express from 'express';
import { getConnection } from './db.js';
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();

router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	let { responses, user_id } = req.body;

	// Validate or generate UUID
	if (!user_id || typeof user_id !== 'string' || !user_id.match(/^[0-9a-fA-F-]{36}$/)) {
		user_id = uuidv4(); // Generate a new UUID if invalid or not provided
	}

	const client = await getConnection(); // Fetch connection once
	try {
		// Loop through the responses object and insert each answer into the database
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await client.query(
				'INSERT INTO answers (user_id, hashed_user_id, question_id, answer_text) VALUES ($1, $2, $3, $4)',
				[user_id, user_id, questionId, answerText]
			);
		}

		// Send success response
		res.status(201).json({ message: 'Answers stored successfully', user_id });
	} catch (error) {
		// Log and send error response
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answers' });
	} finally {
		// Always release the client
		client.release();
	}
});

export default router;
