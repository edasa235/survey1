import { createClient } from '@sanity/client';

const sanity = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET,
	apiVersion: '2023-09-01',
	token: process.env.SANITY_TOKEN,
	useCdn: false,
});

export default async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'GET') {
		try {
			const query = '*[_type == "survey"]{_id, title, questions[]{_key, text, type, options, question_id}}';
			const surveys = await sanity.fetch(query);
			res.status(200).json(surveys);
		} catch (error) {
			console.error('Error fetching questions:', error);
			res.status(500).json({ error: 'Failed to fetch questions' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};
