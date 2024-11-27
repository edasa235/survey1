import { createClient } from '@sanity/client';
import { Router } from 'express';
import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg'; // Import the PostgreSQL client

dotenv.config();
const app = express();
const router = Router();

// PostgreSQL client configuration
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
});

const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	token: process.env.SANITY_TOKEN,
	useCdn: false,
});

// Questions endpoint
router.get('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	try {
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
		const surveys = await sanity.fetch(query);

		// Insert surveys and questions into the PostgreSQL database
		for (const survey of surveys) {
			// Insert survey into the surveys table
			const surveyRes = await pool.query(
				'INSERT INTO surveys(survey_id, title) VALUES($1, $2) RETURNING id',
				[survey._id, survey.title]
			);

			const surveyId = surveyRes.rows[0].id;

			// Insert each question into the questions table
			for (const question of survey.questions) {
				await pool.query(
					'INSERT INTO questions(survey_id, question_id, text, type, options) VALUES($1, $2, $3, $4, $5)',
					[surveyId, question.question_id, question.text, question.type, question.options || null]
				);
			}
		}

		res.status(200).json({ message: 'Data stored successfully' });
	} catch (error) {
		console.error('Error fetching and inserting data:', error);
		res.status(500).json({ error: 'Failed to fetch and store data' });
	}
});

// Handle OPTIONS requests
router.options('/', (req, res) => {
	res.setHeader('Allow', ['GET']);
	res.status(200).end();
});

export default router;
