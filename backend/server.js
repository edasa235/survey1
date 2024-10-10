// Import required packages
import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { createClient } from '@sanity/client'; // Use named export
import { v4 as uuidv4 } from 'uuid';

// MySQL and Sanity configuration
const host = 'localhost';
const user = 'root';
const dbPass = '06Jia_Xiong';
const port = 3000;
const database = 'user_db';

const projectId = 'scr4fyl4';
const dataset = 'production';
const apiVersion = '2023-09-01';
const token = 'skfKo1jiHVNhptN1F028ro14odfFMT8Fzs2ESDy0NhnMvHSnnnQtC9KYnXhUm1gd5j45xBWUkKiT17CwiKpOmekV9kEnCKQfa0Fej48Ex0mFWNbEgDXzaRz7dUIwyZ9tqMKtgOTt4dNtKnu0eQmeml1mhHZG6o7zOqFpUDJHQFLgr601STGs'; // Replace with your actual token
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
app.get('/questions', async (req, res) => {
	try {
		// Sanity query to fetch surveys and questions
		const query = '*[_type == "survey"]{title, questions[]{text, type, options}}';
		const surveys = await sanity.fetch(query);
		console.log('Fetched surveys:', surveys);

		// Connect to the MySQL database
		const connection = await getConnection();

		// Loop through each survey fetched from Sanity
		for (const survey of surveys) {
			// Insert the survey title into the `surveys` table and get the auto-incremented survey_id
			const [surveyResult] = await connection.execute(
				'INSERT INTO surveys (title) VALUES (?)',
				[survey.title]
			);
			const surveyId = surveyResult.insertId; // MySQL auto-incremented survey_id

			// Check if the survey contains questions and if they are iterable
			if (Array.isArray(survey.questions)) {
				for (const question of survey.questions) {
					// Generate a UUID for the question
					const questionId = uuidv4();

					// Insert the question into the `questions` table with the generated UUID and the auto-incremented survey_id
					await connection.execute(
						'INSERT INTO questions (question_id, survey_id, title) VALUES (?, ?, ?)',
						[questionId, surveyId, question.text]
					);
				}
			} else {
				console.warn(`No questions found for survey titled "${survey.title}"`);
			}
		}

		// Close the MySQL connection
		await connection.end();
		// Respond with the fetched surveys
		res.status(200).json(surveys);
	} catch (error) {
		console.error('Error fetching questions from Sanity:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
});

app.post('/answers', async (req, res) => {
	const { question_id, user_id, answer_text } = req.body;

	try {
		// Establish a connection to the MySQL database
		const connection = await getConnection();

		// Insert the answer into the answers table
		const [result] = await connection.execute(
			'INSERT INTO answers (question_id, user_id, answer_text) VALUES (?, ?, ?)',
			[question_id, user_id, answer_text]
		);

		// Close the MySQL connection
		await connection.end();

		// Respond with the answer_id of the newly inserted answer
		res.status(201).json({ answer_id: result.insertId, message: 'Answer stored successfully' });
	} catch (error) {
		console.error('Error storing answer:', error);
		res.status(500).json({ error: 'Failed to store answer' });
	}
});


// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
