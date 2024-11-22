import pkg from 'pg';
const { Pool } = pkg;
import pool, { getConnection } from './db.js';
import router from './export.js'




// Answers endpoint
router.post('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	const { responses, user_id } = req.body;
	const client = await getConnection();
	try {
		// Loop through the responses object and insert each answer into the database
		for (const questionId in responses) {
			const answerText = responses[questionId];
			await (await getConnection()).query(
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
