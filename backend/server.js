

// Import required packages
import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { createClient } from '@sanity/client'; // Use named export

// MySQL and Sanity configuration
const host = 'localhost';
const user = 'root';
const dbPass = '06Jia_Xiong';
const port = 3000;
const database = 'user_db';

const projectId = 'scr4fyl4';
const dataset = 'production';
const apiVersion = '2023-09-01';
const token = 'sk0WcPXvi2dXCLM93EBXrT6rmXve6oIF6PObOEhORqwHzXi0Qmu5oR4Mj7gNlL3krvwRoNQRzJXsV5JhHUnT47RiR85BMEfnFYPUhOvfCLtHyRyUYP7LaOlbNZ03QOF1UJIoCS6MTbOtUasztrRrou8gglm8dMJ9Hny5qdBfMzLCxjbidnPb'; // Replace with your actual token
const useCdn = false;

// MySQL connection configuration
const dbConfig = {
	host: host,
	user: user,
	password: dbPass,
	database: database,
};

const app = express();

// CORS and body-parser middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

// Function to establish a database connection
async function getConnection() {
	try {
		return await mysql.createConnection(dbConfig);
	} catch (error) {
		console.error('Database connection error:', error);
		throw error;
	}
}

// Registration endpoint
app.post('/register', async (req, res) => {
	const { username, password } = req.body;
	console.log('Registration attempt:', { username, password }); // Debugging line
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const connection = await getConnection();

		const [result] = await connection.execute(
			'INSERT INTO users (username, password) VALUES (?, ?)',
			[username, hashedPassword]
		);
		await connection.end();

		console.log('Registration successful:', result); // Debugging line
		res.status(201).json({ user_id: result.insertId, username });
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});

// Login endpoint
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	console.log('Login attempt:', { username, password }); // Debugging line
	try {
		const connection = await getConnection();
		const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
		await connection.end();

		if (rows.length > 0) {
			const user = rows[0];
			const isMatch = await bcrypt.compare(password, user.password);
			console.log('Password match:', isMatch); // Debugging line
			if (isMatch) {
				res.status(200).json({ user_id: user.user_id });
			} else {
				console.log('Invalid password for user:', username); // Debugging line
				res.status(401).json({ error: 'Invalid username or password' });
			}
		} else {
			console.log('No user found with username:', username); // Debugging line
			res.status(401).json({ error: 'Invalid username or password' });
		}
	} catch (error) {
		console.error('Login Error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
});

// Initialize Sanity client
const sanity = createClient({
	projectId: projectId,
	dataset: dataset,
	apiVersion: apiVersion,
	token: token,
	useCdn: useCdn,
});app.get('/questions', async (req, res) => {
	try {
		// Query for surveys and their questions from Sanity
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';

		const surveys = await sanity.fetch(query);
		console.log('Fetched surveys:', surveys);

		const connection = await getConnection();

		for (const survey of surveys) {
			// Insert survey into MySQL if not already present
			const [existingSurvey] = await connection.execute(
				'SELECT * FROM surveys WHERE title = ?',
				[survey.title]
			);
			let surveyId;
			if (existingSurvey.length > 0) {
				// Survey already exists, use its ID
				surveyId = existingSurvey[0].survey_id;
			} else {
				// Insert the survey and get the inserted ID
				const [surveyResult] = await connection.execute(
					'INSERT INTO surveys (title) VALUES (?)',
					[survey.title]
				);
				surveyId = surveyResult.insertId;
			}

			// Process each question in the survey
			if (Array.isArray(survey.questions)) {
				for (const question of survey.questions) {
					let questionId = question.question_id;

					// Check if there's already a question with the same title in this survey
					const [existingQuestionWithTitle] = await connection.execute(
						'SELECT * FROM questions WHERE title = ? AND survey_id = ?',
						[question.text, surveyId]
					);

					if (existingQuestionWithTitle.length > 0) {
						// Question with the same title already exists in this survey, skip insertion
						console.log(`Duplicate question with title "${question.text}" found in survey "${survey.title}", skipping...`);
						continue;
					}

					// Check if the question already has a question_id in Sanity
					if (questionId) {
						// Check if this question_id exists in MySQL
						const [existingQuestion] = await connection.execute(
							'SELECT * FROM questions WHERE question_id = ?',
							[questionId]
						);

						if (existingQuestion.length === 0) {
							// If the question_id does not exist in MySQL, insert it
							await connection.execute(
								'INSERT INTO questions (question_id, survey_id, title) VALUES (?, ?, ?)',
								[questionId, surveyId, question.text]
							);
						}
					} else {
						// If question_id does not exist, generate one
						let isUnique = false;

						// Ensure unique question ID between 1 and 10,000
						while (!isUnique) {
							questionId = Math.floor(Math.random() * 10000) + 1;

							// Check if the generated question_id is unique in MySQL
							const [checkId] = await connection.execute(
								'SELECT * FROM questions WHERE question_id = ?',
								[questionId]
							);
							isUnique = checkId.length === 0; // It's unique if no matching IDs are found
						}

						// Insert the new question into MySQL with the generated question_id
						await connection.execute(
							'INSERT INTO questions (question_id, survey_id, title) VALUES (?, ?, ?)',
							[questionId, surveyId, question.text]
						);

						// Update Sanity with the generated question_id
						const patchResult = await sanity
							.patch(survey._id)
							.set({
								[`questions[_key == "${question._key}"].question_id`]: questionId,
							})
							.commit();

						console.log('Patched question with new ID in Sanity:', patchResult);
					}
				}
			}
		}

		await connection.end();
		res.status(200).json(surveys);
	} catch (error) {
		console.error('Error fetching or updating questions:', error);
		res.status(500).json({ error: 'Failed to fetch or update questions' });
	}
});


// Answers endpoint
// Answers endpoint
app.post('/answers', async (req, res) => {
	const { responses, user_id } = req.body;
	console.log('Received responses:', responses, 'User ID:', user_id);

	try {
		const connection = await getConnection();

		// Iterate through each response
		for (const questionId in responses) {
			const answerText = responses[questionId];
			console.log('Storing answer for question ID:', questionId, 'Answer Text:', answerText);

			// Check if the question ID exists
			const [questionRows] = await connection.execute(
				'SELECT * FROM questions WHERE question_id = ?',
				[questionId]
			);

			if (questionRows.length > 0) {
				// Insert the answer into the answers table
				await connection.execute(
					'INSERT INTO answers (user_id, question_id, answer_text) VALUES (?, ?, ?)',
					[user_id, questionId, answerText]
				);
			} else {
				console.error(`Question ID ${questionId} does not exist in the questions table.`);
			}
		}

		await connection.end();
		res.status(201).json({ message: 'Answers stored successfully' });
	} catch (error) {
		console.error('Error storing answers:', error);
		res.status(500).json({ error: 'Failed to store answer' });
	}
});


// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

