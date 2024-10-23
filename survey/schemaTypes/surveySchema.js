export default {
	name: 'survey',
	title: 'Survey',
	type: 'document',
	fields: [
		{
			name: 'title',
			title: 'Title',
			type: 'string',
		},
		{
			name: 'questions',
			title: 'Questions',
			type: 'array',
			of: [{ type: 'question' }],
		},
	],
};