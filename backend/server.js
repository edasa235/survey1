import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import pincodeRouter from './api/pincode.js';
import loginRouter from './api/login.js';
import registerRouter from './api/register.js';
import questionsRouter from './api/questions.js';
import answersRouter from './api/answers.js';
import pool from './db.js';  // Import the pool connection from your db.js file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// PostgreSQL Connection Test
pool.query('SELECT NOW()', (err, res) => {
	if (err) {
		console.error('Error connecting to PostgreSQL', err.stack);
	} else {
		console.log('PostgreSQL connected:', res.rows[0]);
	}
});

// Use API routes
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/pincode', pincodeRouter);  // Mount the pincodeRouter

// Sample endpoint
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
