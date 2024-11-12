import { createClient } from '@sanity/client';
import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();




const sanityClient = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	token: process.env.SANITY_TOKEN,
	useCdn: false // Optional, use `false` if you need fresh data
});



// Questions endpoint
router.get('/', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	try {
		const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
		const surveys = await sanity.fetch(query);
		res.status(200).json(surveys);
	} catch (error) {
		console.error('Error fetching questions:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
});

// Handle OPTIONS requests
router.options('/', (req, res) => {
	res.setHeader('Allow', ['GET']);
	res.status(200).end();
});
router.get('/', (req, res) => {
	res.send('Welcome to the Express Server!');
});


export default router;
