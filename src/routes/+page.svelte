<script>
    import { client } from '../sanityClient';
    import { onMount } from 'svelte';

    let survey = null;

    onMount(async () => {
        const query = `*[_type == "survey"]{title, questions}`;
        survey = await client.fetch(query);
    });

    let name = '';
    let email = '';
    let responses = {};

    function handleSubmit() {
        console.log({
            name,
            email,
            responses
        });
        // Add logic to handle form submission, e.g., sending data to a server
    }
</script>

{#if survey}
    <main class="p-4 max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4">{survey[0].title}</h1>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" type="text" bind:value={name} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" type="email" bind:value={email} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
            </div>

            {#each survey[0].questions as question}
                <div>
                    <label class="block text-sm font-medium text-gray-700">{question.text}</label>
                    {#if question.type === 'short'}
                        <input type="text" bind:value={responses[question.text]} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    {:else if question.type === 'long'}
                        <textarea bind:value={responses[question.text]} rows="4" class="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                    {:else if question.type === 'multiple'}
                        {#each question.options as option}
                            <div>
                                <input type="radio" id={option} name={question.text} value={option} bind:group={responses[question.text]} />
                                <label for={option} class="ml-2">{option}</label>
                            </div>
                        {/each}
                    {/if}
                </div>
            {/each}

            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
        </form>
    </main>
{/if}
