import express from 'express';

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

import pool from './db.js'
dotenv.config();
const app = express();
const router = express.Router();
const sanityClient = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	token: process.env.SANITY_TOKEN,
	useCdn: false, // false to always fetch fresh data
});
router.get('/', async (req, res) => {
	try {
		// Fetch surveys and questions from Sanity CMS
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
		const surveys = await sanityClient.fetch(query);
		console.log('Fetched surveys:', surveys);

		// Start a PostgreSQL client connection
		const client = await pool.connect();

		try {
			// Process each survey
			for (const survey of surveys) {
				// Check if survey exists in PostgreSQL
				const surveyResult = await client.query('SELECT * FROM surveys WHERE title = $1', [survey.title]);

				let surveyId;
				if (surveyResult.rows.length > 0) {
					// Survey exists, use its ID
					surveyId = surveyResult.rows[0].survey_id;
				} else {
					// Insert survey and get its ID using the helper function
					surveyId = await insertSurvey(survey.title, client);
				}

				// Process each question in the survey
				if (Array.isArray(survey.questions)) {
					for (const question of survey.questions) {
						let questionId = question.question_id;

						// Check if question exists in PostgreSQL
						const questionResult = await client.query(
							'SELECT * FROM questions WHERE text = $1 AND survey_id = $2',
							[question.text, surveyId]
						);

						if (questionResult.rows.length > 0) {
							// Skip if question already exists
							console.log(`Duplicate question with title "${question.text}" found in survey "${survey.title}", skipping...`);
							continue;
						}

						// Check if question has a predefined question_id
						if (questionId) {
							// Check if the question_id already exists
							const existingQuestion = await client.query(
								'SELECT * FROM questions WHERE question_id = $1',
								[questionId]
							);

							if (existingQuestion.rows.length === 0) {
								// Insert question if it doesn't exist
								await client.query(
									'INSERT INTO questions (question_id, survey_id, text, type, options) VALUES ($1, $2, $3, $4, $5)',
									[questionId, surveyId, question.text, question.type, JSON.stringify(question.options || [])]
								);
							}
						} else {
							// Generate a unique question_id if not provided
							let isUnique = false;

							while (!isUnique) {
								questionId = Math.floor(Math.random() * 10000) + 1; // Random ID between 1 and 10,000

								// Ensure the generated ID is unique
								const checkIdResult = await client.query(
									'SELECT * FROM questions WHERE question_id = $1',
									[questionId]
								);
								isUnique = checkIdResult.rows.length === 0;
							}

							// Insert the new question with the generated ID
							await client.query(
								'INSERT INTO questions (question_id, survey_id, text, type, options) VALUES ($1, $2, $3, $4, $5)',
								[questionId, surveyId, question.text, question.type, JSON.stringify(question.options || [])]
							);

							// Patch the question in Sanity with the generated question_id
							const patchResult = await sanityClient
								.patch(survey._id)
								.set({
									[`questions[_key == "${question._key}"].question_id`]: questionId,
								})
								.commit();

							console.log('Patched question with new ID in Sanity:', patchResult);
						}
					}
				}
			}

			// Send the surveys back as a response
			res.status(200).json(surveys);
		} catch (error) {
			console.error('Error processing surveys and questions:', error);
			res.status(500).json({ error: 'Failed to process surveys and questions' });
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error fetching surveys from Sanity:', error);
		res.status(500).json({ error: 'Failed to fetch surveys' });
	}
});
export default router;