// backend/server.js
import express from 'express';
import mysql from 'mysql2/promise'; // Importing mysql2 with promise support

const app = express();
const port = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
	host: 'localhost', // Your database host
	user: 'root', // Your database username
	password: '06Jia_Xiong', // Your database password
	database: 'user_db', // Your database name
};

// Test MySQL connection
async function testDbConnection() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		console.log('Successfully connected to the MySQL database.');


		await connection.end(); // Close the connection
	} catch (error) {
		console.error('Error connecting to the MySQL database:', error);
	}
}

// Call the function to test the connection
testDbConnection();

// Serve static files or API endpoints
app.use(express.json());

// Example API route
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from Express!' });
});

// Start the server
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
