<script>
	import { auth } from '$lib/firebase/client';
	import { sendPasswordResetEmail } from 'firebase/auth';

	let email = '';

	async function resetPassword() {
		try {
			// console.log(email);
			await sendPasswordResetEmail(auth, email);
			alert('Request Sent');
		} catch (error) {
			console.log(error);
			alert('Email not found');
			console.log(error);
		}
	}
</script>

<div class="min-h-screen hero bg-base-200 mx-2">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl my-2">Forgot Password</h1>
		<form class="form-control" on:submit|preventDefault={resetPassword}>
			<p class="text-base my-2">Please enter your email address to reset your password</p>
			<div class="my-5">
				<label>Email</label>
				<input
					class="input input-bordered ml-2"
					type="email"
					id="email"
					placeholder="Email Adress"
					name="resetPassword"
					required
					bind:value={email}
				/>
			</div>
			<div>
				<button class="btn btn-primary" type="submit">Reset Password</button>
				<a href="/login" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
