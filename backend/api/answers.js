import express from 'express';
import { getConnection } from './db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	let { responses, user_id } = req.body;

	// Validate that the user_id is a valid UUID
	if (!uuidValidate(user_id)) {
		return res.status(400).json({ error: 'Invalid user_id format' });
	}

	// Hash the user_id (for security, separate from UUID)
	const hasheduser_id = await bcrypt.hash(user_id, 10);

	const client = await getConnection(); // Fetch connection once
	try {
		// Loop through the responses object and insert each answer into the database
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await client.query(
				'INSERT INTO answers (user_id, hashed_user_id, question_id, answer_text) VALUES ($1, $2, $3, $4)',
				[user_id, hasheduser_id, questionId, answerText]  // Use UUID user_id and hashed version
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
