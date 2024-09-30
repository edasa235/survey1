import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';

const port = process.env.PORT || 5000;

// MySQL connection configuration
const dbConfig = {
	host: 'localhost', // Your database host
	user: 'root', // Your database username
	password: '06Jia_Xiong', // Your database password
	database: 'user_db', // Your database name
};

const app = express();

// Make sure CORS is configured here, after defining `app`
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your SvelteKit frontend
app.use(bodyParser.json());

// Function to establish a database connection
async function getConnection() {
	return await mysql.createConnection(dbConfig);
}

// Webhook handler for Sanity
app.post('/sanity-webhook', async (req, res) => {
	const questionData = req.body; // Get the payload from Sanity
	const { text, type, options } = questionData;

	// Check if this is a question object
	if (questionData._type === 'question') {
		try {
			const connection = await getConnection();
			const sql = `INSERT INTO questions (question_text) VALUES (?)`;
			const [result] = await connection.execute(sql, [text]);
			await connection.end();

			console.log('Question saved to database with ID:', result.insertId);
			res.status(200).send('Success');
		} catch (err) {
			console.error('Error saving question to database:', err);
			return res.status(500).send('Internal Server Error');
		}
	} else {
		res.status(400).send('Not a question object');
	}
});

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

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});