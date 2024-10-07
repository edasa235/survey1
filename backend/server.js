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
		const query = '*[_type == "survey"] { _id, title, questions }';
		const surveys = await sanity.fetch(query);
		console.log('Fetched surveys from Sanity:', JSON.stringify(surveys, null, 2));

		const connection = await getConnection();

		for (const survey of surveys) {
			const surveyId = survey._id; // Capture survey ID
			const surveyTitle = survey.title; // Capture survey title

			// Insert or update the survey in the database
			await connection.execute(
				`INSERT INTO surveys (survey_id, title)
         VALUES (?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title)`,
				[surveyId, surveyTitle]
			);
			console.log(`Survey ${surveyId} inserted/updated`);

			for (const question of survey.questions) {
				// Update this part to check for `_key` instead of `_id`
				if (question.text !== undefined && question._key !== undefined) {
					await connection.execute(
						`INSERT INTO questions (question_id, survey_id, question_text)
             VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE question_text = VALUES(question_text)`,
						[question._key, surveyId, question.text] // Use question._key here
					);
					console.log(`Question ${question._key} inserted/updated for survey ${surveyId}`);
				} else {
					console.error('Question missing text or _key:', question);
				}
			}
		}

		await connection.end();
	} catch (error) {
		console.error('Error fetching and inserting data from Sanity:', error);
		throw error;
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
}, 50000); // 1 minutes in milliseconds

// Initial poll at server startup
pollSanityData()
	.then(() => console.log("Initial polling completed"))
	.catch(error => console.error("Error during initial polling:", error));

// Start Express server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
// Create a route to manually trigger the update
app.get('/update', async (req, res) => {
	try {
		// Call the function to fetch and update data from Sanity
		await pollSanityData();
		res.status(200).json({ message: "Data update successful" });
	} catch (error) {
		console.error('Error during manual update:', error);
		res.status(500).json({ error: 'Manual update failed' });
	}
});
