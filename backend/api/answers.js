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
		user_id = uuidv4();
	}
	console.log('Incoming request body:', req.body);
	console.log('Final user_id:', user_id);

	if (!responses || typeof responses !== 'object') {
		return res.status(400).json({ error: 'Invalid responses format' });
	}

	const client = await getConnection();
	try {
		for (const questionId of Object.keys(responses)) {
			const answerText = responses[questionId];
			await client.query(
				'INSERT INTO answers (user_id, question_id, answer_text) VALUES ($1, $2, $3)',
				[user_id, questionId, answerText] // Fixed the parameter order
			);
		}

		res.status(201).json({ message: 'Answers stored successfully', user_id });
	} catch (error) {
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answers' });
	} finally {
		client.release();
	}
});

export default router;
