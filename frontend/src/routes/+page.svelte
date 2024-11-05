<script>
    import { client } from '../sanityClient.js';
    import { onMount } from 'svelte';
    const apiUrl = import.meta.env.VITE_API_URL;

    let survey = null;
    let responses = {};
    let showSignUpModal = false;
    let showLoginModal = false;
    let isloggedin = false;

    let username = '';
    let password = '';
    let user_id = null;
    onMount(async () => {
        try {
            const response = await fetch('https://backend-survey-32fa.onrender.com/api/questions');
            if (response.ok) {
                survey = await response.json();
                console.log(survey); // Check the structure of the survey data
            } else {
                console.error('Failed to fetch questions');
            }
        } catch (error) {
            console.error('Error fetching survey data:', error);
        }
    });


    async function handleSubmit() {
        try {
            const response = await fetch('https://backend-survey-32fa.onrender.com/api/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ responses, user_id }) // Send user ID along with responses
            });

            const result = await response.json();
            if (response.ok) {
                alert('Survey submitted successfully!');
            } else {
                console.error('Survey submission failed:', result.error);
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
        }
    }


    function toggleSignUpModal() {
        showSignUpModal = !showSignUpModal;
    }

    function toggleLoginModal() {
        showLoginModal = !showLoginModal;
    }

    async function handlesignup(event) {
        event.preventDefault();
        try {
            const response = await fetch('https://backend-survey-32fa.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                console.log('Registration successful', data);
                // Optionally close modal or reset fields
            } else {
                console.error('Registration Error:', data.error);
            }
        } catch (error) {
            console.error('Registration Error:', error);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            const response = await fetch('https://backend-survey-32fa.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                console.log('Login successful');
                user_id = data.user_id; // Update user_id with the received value

                // Close the login modal
                isloggedin = true;
                showLoginModal = false; // Close the login modal

                // Fetch the survey data after logging in
                survey = await client.fetch(`*[_type == "survey"]{title, questions}`);

                // Show a confirmation message
                alert("Login successful!");
            } else {
                console.error('Login Error:', data.error);
            }
        } catch (error) {
            console.error('Login Error:', error);
        }
    }

</script>

<header class="bg-gray-800 p-4">
    <nav class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="text-white text-lg font-bold">Survey App</div>
        <ul class="flex space-x-6">
            <li><a href="/frontend/static" class="text-gray-300 hover:text-white">Home</a></li>
            <li><a href="/about" class="text-gray-300 hover:text-white">About</a></li>
            <li><a href="/contact" class="text-gray-300 hover:text-white">Contact</a></li>
        </ul>
        <div>
            <button class="px-4 py-2 bg-green-500 text-white rounded-md" on:click={toggleSignUpModal}>Sign Up</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-md ml-4" on:click={toggleLoginModal}>Login</button>
        </div>
    </nav>
</header>

<style>


    .input-field,
    .textarea-field {
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 0.5rem;
        width: 100%;
        margin-top: 0.5rem;
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 100%;
    }

    .modal-header {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }

    .question-container {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background-color: #f7fafc;
    }

    .question-text {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .input-field{ border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.5rem; width: 100%; margin-top: 0.5rem; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 10; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; width: 100%; }
    .modal-header { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
    .question-container { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f7fafc; }
    .question-text { font-weight: bold; margin-bottom: 0.5rem; }
</style>

<!-- Sign Up Modal -->
{#if showSignUpModal}
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">Sign Up</div>
            <form on:submit|preventDefault={handlesignup}>
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input id="username" type="text" bind:value={username} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>

                <div class="mt-4">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input id="password" type="password" bind:value={password} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>

                <div class="mt-6 flex justify-between">
                    <button type="button" class="px-4 py-2 bg-gray-500 text-white rounded-md" on:click={toggleSignUpModal}>Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-md">Sign Up</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Login Modal -->
{#if showLoginModal}
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">Login</div>
            <form on:submit|preventDefault={handleLogin}>
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input id="username" type="text" bind:value={username} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>

                <div class="mt-4">
                    <label for="login-password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input id="login-password" type="password" bind:value={password} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>

                <div class="mt-6 flex justify-between">
                    <button type="button" class="px-4 py-2 bg-gray-500 text-white rounded-md" on:click={toggleLoginModal}>Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Login</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Survey Content -->
{#if survey}
    {#each survey as surveyItem (surveyItem._id)}
        <div class="survey-container">
            <h2>{surveyItem.title}</h2>
            {#each surveyItem.questions as question (question._key)}
                <div class="question-container">
                    <div class="question-text">
                        <span>Question ID: {question.question_id}</span> - {question.text}
                    </div>
                    {#if question.options && question.options.length > 0}
                        <!-- Render options if available -->
                        {#each question.options as option}
                            <label class="block mt-2">
                                <input
                                  type="radio"
                                  bind:group={responses[question.question_id]}
                                  value={option}
                                  class="mr-2"
                                />
                                {option}
                            </label>
                        {/each}
                    {:else}
                        <!-- Render a text input for questions without options -->
                        <input
                          type="text"
                          bind:value={responses[question.question_id]}
                          class="input-field border border-gray-300 rounded-md p-2 w-full mt-2"
                          placeholder="Your answer here"
                        />
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
    <button on:click={handleSubmit} class="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
        Submit
    </button>
{/if}
hellloos