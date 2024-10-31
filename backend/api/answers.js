import mysql from 'mysql2/promise';

async function getConnection() {
	const dbConfig = {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
	};
	return mysql.createConnection(dbConfig);
}

export default async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'POST') {
		const { responses, user_id } = req.body;

		try {
			const connection = await getConnection();

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
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};
