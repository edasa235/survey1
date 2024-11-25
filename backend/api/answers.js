import express from 'express';
import { getConnection } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	let { responses, user_id } = req.body;

	console.log('Received request with:', { user_id, responses });

	// Validate or generate UUID
	if (!user_id || !/^[0-9a-fA-F-]{36}$/.test(user_id)) {
		console.warn(`Invalid or missing user_id: ${user_id}, generating new UUID`);
		user_id = uuidv4();
	}

	const client = await getConnection();
	try {
		// Ensure `responses` is an object
		if (typeof responses !== 'object' || responses === null) {
			throw new Error('Invalid responses format, expected an object');
		}

		// Insert answers into the database
		for (const questionId in responses) {
			const answerText = responses[questionId];
			console.log(`Storing response: user_id=${user_id}, question_id=${questionId}, answer_text=${answerText}`);

			await client.query(
				'INSERT INTO answers (user_id, question_id, answer_text) VALUES ($1, $2, $3)',
				[user_id, questionId, answerText]
			);
		}

		res.status(201).json({ message: 'Answers stored successfully', user_id });
	} catch (error) {
		console.error('Error storing answers:', error.message);
		res.status(500).json({ error: 'Failed to store answers', details: error.message });
	} finally {
		client.release();
	}
});

export default router;
