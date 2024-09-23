import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';

const port = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
	host: 'localhost', // Your database host
	user: 'root', // Your database username
	password: '06Jia_Xiong', // Your database password
	database: 'user_db', // Your database name
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Function to establish a database connection
async function getConnection() {
	return await mysql.createConnection(dbConfig);
}
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
