<script>
	let username = '';  // Define your username and password variables
	let password = '';  // Define your password variable

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
</script>

<header class="bg-gray-800 p-4">
	<nav class="max-w-7xl mx-auto flex justify-between items-center">
		<div class="text-white text-lg font-bold">Survey App HELLO</div>
		<div>
			<button class="px-4 py-2 bg-green-500 text-white rounded-md" >Export Survey Data</button>
			<button class="px-4 py-2 bg-green-500 text-white rounded-md" on:click={toggleSignUpModal}>Sign Up</button>
			<button class="px-4 py-2 bg-blue-500 text-white rounded-md ml-4" >Login</button>
			<button class="px-4 py-2 bg-orange-500 text-white rounded-md ml-4">Pin Code</button>
		</div>
	</nav>
</header>
