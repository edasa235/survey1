import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

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


// Sample endpoint: Welcome message
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});
