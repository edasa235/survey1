import express from 'express';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Sanity client
const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	apiVersion: '2023-09-01',
	token: process.env.SANITY_TOKEN,
	useCdn: false,
});

// Questions endpoint
router.get('/', async (req, res) => {
	try {
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
		const surveys = await sanity.fetch(query);
		res.status(200).json(surveys);
	} catch (error) {
		console.error('Error fetching questions:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
});

export default router;