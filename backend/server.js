import express from 'express';

import bodyParser from 'body-parser';
import cors from 'cors';

import dotenv from 'dotenv';



dotenv.config();

import loginRouter from './api/login.js';
import registerRouter from './api/register.js';
import questionsRouter from './api/questions.js';
import answersRouter from './api/answers.js';

const app = express();
const port =  3000;

app.use(cors({ origin: '*' })); // Allow all origins (or specify your frontend origin)
app.use(bodyParser.json());
dotenv.config();
console.log("Sanity Project ID:", process.env.SANITY_PROJECT_ID);
console.log("Sanity Dataset:", process.env.SANITY_DATASET);
console.log("Sanity Token:", process.env.SANITY_TOKEN);

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

// Sample endpoint: Welcome message
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});

console.log(port)