export default  {
    name: 'question',
    title: 'Question',
    type: 'document',
    fields: [
        {
            name: 'question_id',
            title: 'Question ID',
            type: 'string', // Use string to store UUID
            initialValue: '0', // You can update this later in your code to generate unique IDs
            options: {
                isUnique: true, // Ensures question IDs are unique
            },
        },
        {
            name: 'text',
            title: 'Question Text',
            type: 'string',
        },
        {
            name: 'type',
            title: 'Question Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Multiple Choice', value: 'multiple-choice' },
                    { title: 'Short Answer', value: 'short-answer' },
                    { title: 'Long Answer', value: 'long-answer' },
                ],
                layout: 'dropdown', // optional: to enforce a dropdown selection for question types
            },
        },
        {
            name: 'options',
            title: 'Options',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: ({ parent }) => parent.type !== 'multiple-choice', // Only show options field for multiple-choice questions
        },
    ],
};
