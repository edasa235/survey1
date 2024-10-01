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

const app =  express();

// Make sure CORS is configured here, after defining `app`
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your SvelteKit frontend
app.use(bodyParser.json());

// Function to establish a database connection
async function getConnection() {
	return mysql.createConnection(dbConfig);
}
app.post('/sanity-webhook', async (req, res) => {
	const { _id, _type, text, type, options, operationType } = req.body; // Get the question data from the webhook
	const connection = await getConnection();

	try {
		if (_type === 'question') {
			if (operationType === 'create') {
				// Insert new question into the database
				await connection.execute(
					'INSERT INTO questions (id, text, type, options) VALUES (?, ?, ?, ?)',
					[_id, text, type, JSON.stringify(options || [])]
				);
				res.status(200).json({ message: 'Question created successfully' });
			} else if (operationType === 'update') {
				// Update existing question in the database
				await connection.execute(
					'UPDATE questions SET text = ?, type = ?, options = ? WHERE id = ?',
					[text, type, JSON.stringify(options || []), _id]
				);
				res.status(200).json({ message: 'Question updated successfully' });
			} else if (operationType === 'delete') {
				// Delete question from the database
				await connection.execute(
					'DELETE FROM questions WHERE id = ?',
					[_id]
				);
				res.status(200).json({ message: 'Question deleted successfully' });
			}
		} else {
			res.status(400).json({ message: 'Invalid document type' });
		}
	} catch (error) {
		console.error('Error processing webhook:', error);
		res.status(500).json({ error: 'Failed to process webhook' });
	} finally {
		await connection.end();
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
