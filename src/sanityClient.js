import sanityClient from '@sanity/client';

export const client = sanityClient({
    projectId: 'scr4fyl4', // Your project ID
    dataset: 'production', // Your dataset
    apiVersion: '2023-09-01', // Use the current API version
    useCdn: true, // Use CDN for faster response times
});
