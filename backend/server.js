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

// Fetch questions from Sanity API
app.get('/questions', async (req, res) => {
	try {
		const query = '*[_type == "survey"]{title, questions[]{text, type, options}}'; // Query to fetch surveys and their questions
		const questions = await sanity.fetch(query); // Fetch data from Sanity
		res.status(200).json(questions); // Send the fetched data as a response
	} catch (error) {
		console.error('Error fetching questions from Sanity:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
