import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';


import loginRouter from './api/login.js';
import registerRouter from './api/register.js';
import questionsRouter from './api/questions.js';
import answersRouter from './api/answers.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000

app.use(cors({ origin: '*' })); // Allow all origins (or specify your frontend origin)
app.use(bodyParser.json());

// Use the API routes
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});


// Load environment variables from .env file
dotenv.config();



// MySQL database configuration
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
};

// Initialize Sanity client
const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	apiVersion: '2023-09-01',
	token: process.env.SANITY_TOKEN,
	useCdn: false,
});



// Function to establish a database connection
async function getConnection() {
	return await mysql.createConnection(dbConfig);
}

// Sample endpoint: Welcome message
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

// Registration endpoint
app.post('/register', async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const connection = await getConnection();
		const [result] = await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
		await connection.end();
		res.status(201).json({ user_id: result.insertId, username });
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
});

// Login endpoint
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const connection = await getConnection();
		const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
		await connection.end();

		if (rows.length > 0) {
			const user = rows[0];
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				res.status(200).json({ user_id: user.user_id });
			} else {
				res.status(401).json({ error: 'Invalid username or password' });
			}
		} else {
			res.status(401).json({ error: 'Invalid username or password' });
		}
	} catch (error) {
		console.error('Login Error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
});

// Questions endpoint
app.get('/questions', async (req, res) => {
	try {
		// Query for surveys and their questions from Sanity
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
		const surveys = await sanity.fetch(query);

		// You can handle the insertion of surveys/questions into MySQL here

		res.status(200).json(surveys);
	} catch (error) {
		console.error('Error fetching questions:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
});

// Answers endpoint
app.post('/answers', async (req, res) => {
	const { responses, user_id } = req.body;
	try {
		const connection = await getConnection();

		// Store answers in MySQL
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
});
app.post('/pincode', async (req, res) => {
	const { user_id } = req.body; // Only extract user_id from req.body

	// Generate a random pincode
	const pincode = Math.floor(Math.random() * 9999) + 1;

	let connection;
	try {
		connection = await getConnection();

		// Insert user_id and generated pincode into the USERS table
		const [result] = await connection.execute(`INSERT INTO USERS (user_id, pincode) VALUES (?, ?)`, [user_id, pincode]);

		// Optionally, send a response back to the client
		res.status(200).json({ message: 'Pincode generated and stored successfully.', pincode });
	} catch (error) {
		console.error('Error inserting pincode:', error);
		res.status(500).json({ error: 'An error occurred while storing the pincode.' });
	} finally {
		if (connection) {
			await connection.end(); // Ensure the connection is closed
		}
	}
});
const cors = require('cors');
app.use(cors({
	origin: 'https://survey-g8oineryc-edasa235s-projects.vercel.app',
	methods: ['GET', 'POST'],
}));
