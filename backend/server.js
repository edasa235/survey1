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
});
// Fetch questions endpoint
app.get('/questions', async (req, res) => {
	try {
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options}}';
		const surveys = await sanity.fetch(query);
		console.log('Fetched surveys:', surveys);

		const connection = await getConnection();

		for (const survey of surveys) {
			const [surveyResult] = await connection.execute(
				'INSERT INTO surveys (title) VALUES (?)',
				[survey.title]
			);
			const surveyId = surveyResult.insertId;

			if (Array.isArray(survey.questions)) {
				for (const question of survey.questions) {
					// Check if the question already exists in MySQL
					const [existingQuestions] = await connection.execute(
						'SELECT * FROM questions WHERE title = ? AND survey_id = ?',
						[question.text, surveyId]
					);

					if (existingQuestions.length === 0) {
						// Only generate a new question ID if it doesn't exist
						let questionId = null; // Initialize questionId
						let isUnique = false;

						// Ensure unique question ID between 1 and 10,000
						while (!isUnique) {
							questionId = Math.floor(Math.random() * 10000) + 1; // Random integer between 1-10,000

							// Check if the generated ID already exists
							const [checkId] = await connection.execute(
								'SELECT * FROM questions WHERE question_id = ?',
								[questionId]
							);
							isUnique = checkId.length === 0; // If not found, it's unique
						}

						// Insert the question into MySQL
						await connection.execute(
							'INSERT INTO questions (question_id, survey_id, title) VALUES (?, ?, ?)',
							[questionId, surveyId, question.text]
						);

						// Update Sanity CMS with the generated question ID for this question
						const patchResult = await sanity
							.patch(survey._id)
							.set({
								[`questions[_key == "${question._key}"].question_id`]: questionId,
							})
							.commit();

						console.log('Patch result:', patchResult);
					} else {
						console.log(`Question "${question.text}" already exists in MySQL.`);
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
app.post('/answers', async (req, res) => {
	const { responses, user_id } = req.body;
	console.log('Received responses:', responses, 'User ID:', user_id);

	try {
		const connection = await getConnection();

		// Iterate through each response
		for (const questionId in responses) {
			const answer = responses[questionId];
			console.log('Storing answer for question ID:', questionId, 'answer:', answer);

			// Check if the question ID exists
			const [questionRows] = await connection.execute(
				'SELECT * FROM questions WHERE question_id = ?',
				[questionId]
			);

			if (questionRows.length > 0) {
				// Insert the answer into the answers table
				await connection.execute(
					'INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)',
					[user_id, questionId, answer]
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

