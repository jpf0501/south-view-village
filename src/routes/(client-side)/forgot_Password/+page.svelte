<script>
	import { auth } from '$lib/firebase/client';
	import { sendPasswordResetEmail } from 'firebase/auth';

	let email = '';

	async function resetPassword() {
		try {
			// console.log(email);
			await sendPasswordResetEmail(auth, email);
			alert('Request success');
		} catch (error) {
			console.log(error);
			alert('Error to request reset password');
		}

		// .then(() => {
		// 	console.log(email);
		// 	alert('Request for reset password sent');
		// })
		// .catch((error) => {
		// 	const errorCode = error.code;
		// 	const errorMessage = error.message;
		// 	alert('Error to request reset password');
		// 	// ..
		// });
	}
</script>

<div>
	<h1>Forgot Password</h1>
	<div>
		<form on:submit|preventDefault={resetPassword}>
			<p>Enter email address to reset password</p>
			<div>
				<label>Email</label>
				<input
					type="email"
					id="email"
					placeholder="Email Adress"
					class="form-control"
					name="resetPassword"
					required
					bind:value={email}
				/>
			</div>
			<div>
				<button type="submit">Reset Password</button>
			</div>
		</form>
	</div>
</div>
