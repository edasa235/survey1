export default {
    name: 'question',
    title: 'Question',
    type: 'object',
    fields: [
        {
            name: 'question_id',
            title: 'Question ID',
            type: 'number',
            description: 'Unique ID for the question',
            readOnly: true, // This can be true if you want it to be auto-generated and not editable manually
        },
        {
            name: 'text',
            title: 'Text',
            type: 'string',
        },
        {
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Short Answer', value: 'short' },
                    { title: 'Long Answer', value: 'long' },
                    { title: 'Multiple Choice', value: 'multiple' },
                ],
            },
        },
        {
            name: 'options',
            title: 'Options',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: ({ parent }) => {
                console.log("Parent type:", parent?.type); // Debugging line
                return parent?.type !== 'multiple';
            },

        },
    ],
};
