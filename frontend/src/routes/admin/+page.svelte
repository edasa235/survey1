
<script>
    let showPinCodeModal = false
    let pinCodesGenerating = 5
    let pinCodes = ["1245","1245","1245"]
    let pinCodesString = ""

    function generateCode() {return(String(Math.floor(1000 + Math.random()*9000)))}

    function generatePinCodes() {
        if(pinCodesGenerating > 2000) {pinCodesGenerating = 2000}

        pinCodesString = ""
        pinCodes = []
        let pinCodeGenerated = ""
        for (let i = 0; i < pinCodesGenerating; i++) {
            pinCodeGenerated = generateCode()
            while (pinCodes.includes(pinCodeGenerated)) {
                pinCodeGenerated = generateCode()
            }
            pinCodes.push(pinCodeGenerated)
        }

        for (let i = 0; i < pinCodesGenerating; i++) {
            pinCodesString += pinCodes[i]
            if(i != pinCodesGenerating-1) {
                pinCodesString += "\n"
            }
        }
        
        
    }
    /*
    import { client } from '../sanityClient.js';
    import { onMount } from 'svelte';
    const apiUrl = import.meta.env.VITE_API_URL;

    let survey = null;
    let responses = {};
    let showSignUpModal = false;
    let showLoginModal = false;
    ;
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
        password = ""
        username = ""
    }

    function toggleLoginModal() {
        showLoginModal = !showLoginModal;
        password = ""
        username = ""
    }
    */

    function togglePinCodeModal() {
        showPinCodeModal = !showPinCodeModal;

        //document.getElementById(test1).focus()
    }

</script>


<header class="bg-gray-800 p-4">
    <nav class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="text-white text-lg font-bold">Survey App HELLO</div>
        <ul class="flex space-x-6">
            <li><a href="/frontend/static" class="text-gray-300 hover:text-white">Home</a></li>
            <li><a href="/about" class="text-gray-300 hover:text-white">About</a></li>
            <li><a href="/contact" class="text-gray-300 hover:text-white">Contact</a></li>
            <li><a href="/admin" class="text-gray-300 hover:text-white"> Admin page                            </a></li>
        </ul>
        <div>
            <button class="px-4 py-2 bg-green-500 text-white rounded-md" on:click={togglePinCodeModal}>Generate Pin Code</button>
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
    .pincode {letter-spacing: 10px;}
</style>

<!-- Pin Code Modal -->
{#if showPinCodeModal}
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">Generate Pin-Codes</div>
            
            <form on:submit|preventDefault={generatePinCodes}>
                <div>
                    <input id="pincode" type="number" bind:value={pinCodesGenerating} style="width: 30%;" class="mt-1 w-full p-2 border border-gray-300 rounded-md text-xl text-center" required />
                    <button type="submit" style="width: 68%;" class="mt-1 w-full p-2 border border-gray-300 bg-blue-500 text-white rounded-md text-xl text-center">Generate</button>
                    
<textarea id="pincodesgenerated" name="pin codes generated" class="mt-1 block w-full p-2 border border-gray-300 rounded-md text-xl" rows="4" cols="30">{pinCodesString}</textarea>
                </div>

                <div class="mt-6 flex justify-between">
                    <button type="button" class="px-4 py-2 bg-gray-500 text-white rounded-md" on:click={togglePinCodeModal}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
{/if}