import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import sanityClient from '@sanity/client';


const host = 'localhost';
const user = 'root';
const dbPass = '06Jia_Xiong';
const port = 3000;
const database = 'user_db';

const projectId = 'scr4fyl4';
const dataset = 'production';
const apiVersion = '2023-09-01';
const token = 'sk4LYY6T79cO2u1lHREs95Q6yT9D9oba1PSl34ubiInOZLVK6U1aeApWqueR6hdZs5ncVYYNTvHK6YbAzBoFzd9K8F9XgEYfsu4vvAXoifIacrsu2PeCwfaoIYlWSrNNYRMuFEyLxjUMN4yuCJOACDKLtaHVeyqistnoOZJVrv9Bzx4QGc20';
const useCdn = false;


// MySQL connection configuration using environment variables
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
	return mysql.createConnection(dbConfig);
}

// Registration endpoint
app.post('/register', async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const connection = await getConnection();

		const [result] = await connection.execute(
			'INSERT INTO users (username, password) VALUES (?, ?)',
			[username, hashedPassword]
		);
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
			if (await bcrypt.compare(password, user.password)) {
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

// Initialize Sanity client using environment variables
const sanity = sanityClient({
	projectId: projectId,
	dataset: dataset,
	apiVersion: apiVersion,
	token: token,
	useCdn: useCdn,
});// Update the pollSanityData function to return fetched questions

async function pollSanityData() {
	try {
		const query = '*[_type == "survey"] { questions }'; // Fetch surveys with questions
		const surveys = await sanity.fetch(query);
		console.log('Fetched surveys from Sanity:', JSON.stringify(surveys, null, 2)); // Detailed logging

		const connection = await getConnection();
		const insertedQuestions = []; // To store the details of inserted questions

		for (const survey of surveys) {
			for (const question of survey.questions) {
				console.log('Question object:', question); // Log each question object

				// Check if text and _id exist
				if (question.text !== undefined && question._id !== undefined) {
					await connection.execute(
						'INSERT INTO questions (question_text, _id) VALUES (?, ?) ON DUPLICATE KEY UPDATE question_text = VALUES(question_text)',
						[question.text, question._id]
					);
					console.log(`Question ${question._id} inserted/updated`);
					insertedQuestions.push({ id: question._id, text: question.text }); // Store inserted questions
				} else {
					console.error('Question missing text or _id:', question);
				}
			}
		}

		await connection.end();
		return insertedQuestions; // Return the inserted questions
	} catch (error) {
		console.error('Error fetching questions from Sanity:', error);
		throw error; // Rethrow the error for handling in the endpoint
	}
}

// Create a route to manually trigger the polling
app.get('/poll', async (req, res) => {
	try {
		const fetchedQuestions = await pollSanityData(); // Manually call the polling function
		res.status(200).json({
			message: "Polling successful",
			questions: fetchedQuestions, // Include the fetched questions in the response
		});
	} catch (error) {
		console.error('Error during manual polling:', error);
		res.status(500).json({ error: 'Manual polling failed' });
	}
});


// Polling Sanity CMS data every 5 minutes (300000 ms)
setInterval(() => {
	pollSanityData()
		.then(() => console.log("Polling successful"))
		.catch((error) => console.error("Polling failed", error));
}, 300000); // 5 minutes in milliseconds

// Initial poll at server startup
pollSanityData()
	.then(() => console.log("Initial polling completed"))
	.catch(error => console.error("Error during initial polling:", error));

// Start Express server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
// Create a route to manually trigger the polling
