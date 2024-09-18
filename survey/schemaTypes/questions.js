export default {
    name: 'question',
    title: 'Question',
    type: 'object',
    fields: [
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
            hidden: ({ parent }) => parent?.type !== 'multiple',
        },
    ],
};