import express from 'express';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();


const router = express.Router();

// Initialize Sanity client
const sanityClient = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	token: process.env.SANITY_TOKEN,
	useCdn: false, // Always fetch fresh data
});

// Helper function to insert a survey into PostgreSQL
const insertSurvey = async (title, client) => {
	try {
		// First query: Insert the survey
		const insertQuery = `
			INSERT INTO surveys (title)
			VALUES ($1)
		`;
		await client.query(insertQuery, [title]);

		// Second query: Retrieve the survey_id of the newly inserted survey
		const selectQuery = `
			SELECT survey_id
			FROM surveys
			WHERE title = $1
		`;
		const result = await client.query(selectQuery, [title]);

		if (result.rows.length === 0) {
			throw new Error('Survey ID not found after insertion');
		}

		return result.rows[0].survey_id;
	} catch (error) {
		console.error('Error inserting survey:', error.message);
		throw new Error('Failed to insert survey');
	}
};

// Route to fetch and process surveys and questions
router.get('/', async (req, res) => {
	try {
		// Fetch surveys and questions from Sanity CMS
		const query = `
      *[_type == "survey"]{
        _id, title, questions[]{
          _key, text, type, options, question_id
        }
      }
    `;
		const surveys = await sanityClient.fetch(query);
		console.log('Fetched surveys:', surveys);

		// Start a PostgreSQL client connection
		const client = await pool.connect();

		try {
			// Process each survey
			for (const survey of surveys) {
				if (!survey.title || !survey._id) {
					console.error('Survey is missing title or _id:', survey);
					throw new Error('Survey is missing required fields');
				}

				// Check if survey exists in PostgreSQL
				const checkSurveyQuery = `
					SELECT survey_id
					FROM surveys
					WHERE title = $1
				`;
				const surveyResult = await client.query(checkSurveyQuery, [survey.title]);

				let surveyId;
				if (surveyResult.rows.length > 0) {
					// Survey exists, use its ID
					surveyId = surveyResult.rows[0].survey_id;
				} else {
					// Insert survey and get its ID
					surveyId = await insertSurvey(survey.title, client);
				}

				// Process each question in the survey
				if (Array.isArray(survey.questions)) {
					for (const question of survey.questions) {
						if (!question.text) {
							console.error('Question is missing text:', question);
							throw new Error(`Question in survey "${survey.title}" is missing required fields`);
						}

						let questionId = question.question_id;

						// Check if question exists in PostgreSQL
						const checkQuestionQuery = `
							SELECT *
							FROM questions
							WHERE text = $1 AND survey_id = $2
						`;
						const questionResult = await client.query(checkQuestionQuery, [
							question.text,
							surveyId,
						]);

						if (questionResult.rows.length > 0) {
							console.log(
								`Duplicate question "${question.text}" found in survey "${survey.title}", skipping...`
							);
							continue;
						}

						// Check if question_id exists or generate one
						if (!questionId) {
							let isUnique = false;

							while (!isUnique) {
								questionId = Math.floor(Math.random() * 10000) + 1; // Random ID between 1 and 10,000

								// Ensure the generated ID is unique
								const checkIdQuery = `
									SELECT *
									FROM questions
									WHERE question_id = $1
								`;
								const checkIdResult = await client.query(checkIdQuery, [questionId]);
								isUnique = checkIdResult.rows.length === 0;
							}
						}

						// Insert question into PostgreSQL
						const insertQuestionQuery = `
              INSERT INTO questions (question_id, survey_id, text, type, options) 
              VALUES ($1, $2, $3, $4, $5)
            `;
						await client.query(insertQuestionQuery, [
							questionId,
							surveyId,
							question.text,
							question.type,
							JSON.stringify(question.options || []),
						]);

						// Patch question_id in Sanity if generated
						if (!question.question_id) {
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
