<script>
	let survey = null;
	let showSignUpModal = false;
	let showLoginModal = false;

	let isloggedin = false;

	let username = '';
	let password = '';



	let user_id = null;





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
	async function handlesignup(event) {
		event.preventDefault();
		try {
			const response = await fetch('http://localhost:10000/api/register', {
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



	// Function to download the exported CSV
	const downloadExport = async () => {
		try {
			const response = await fetch('https://backend-survey-32fa.onrender.com/api/export');
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'answers.csv';
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);
			} else {
				alert('Failed to export data');
			}
		} catch (error) {
			console.error('Error downloading export:', error);
			alert('An error occurred during the export');
		}
	};
	async function handleLogin(event) {
		event.preventDefault();

		try {
			const response = await fetch('http://localhost:10000/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
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
		<div class="text-white text-lg font-bold">Survey App HELLO</div>
		<ul class="flex space-x-6">
			<li><a href="/frontend/static" class="text-gray-300 hover:text-white">Home</a></li>
			<li><a href="/about" class="text-gray-300 hover:text-white">About</a></li>
			<li><a href="/contact" class="text-gray-300 hover:text-white">Contact</a></li>
			<li><a href="/admin" class="text-gray-300 hover:text-white"> Admin page                            </a></li>
		</ul>
		<div>
			<button class="px-4 py-2 bg-green-500 text-white rounded-md" on:click={downloadExport}>Export Survey Data</button>
			<button class="px-4 py-2 bg-green-500 text-white rounded-md" on:click={toggleSignUpModal}>Sign Up</button>
			<button class="px-4 py-2 bg-blue-500 text-white rounded-md ml-4" on:click={toggleLoginModal}>Login</button>

		</div>
	</nav>
</header>

<style>

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

    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 10; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; width: 100%; }
    .modal-header { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }

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