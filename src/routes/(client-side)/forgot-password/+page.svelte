<script>
	import { auth } from '$lib/firebase/client';
	import { db } from '$lib/firebase/client';
	import { sendPasswordResetEmail } from 'firebase/auth';
	import { getDocs, query, collection, where } from 'firebase/firestore';
	import toast from 'svelte-french-toast';

	let email = '';
	let errors = {};

	async function resetPassword() {
		const accountsQuery = query(collection(db, 'accounts'), where('email', '==', email));
		const accountsSnapshot = await getDocs(accountsQuery);
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		errors = {
			emailNull: !email,
			invalidEmail: !emailRegex.test(email)
		};
		if (accountsSnapshot.docs.length === 0) {
			toast.error('No email found');
			return;
		}
		try {
			await sendPasswordResetEmail(auth, email);
			email = '';
			toast.success('Request for reset password sent');
		} catch (error) {
			console.log(error);
		}
	}
</script>

<div class="min-h-screen bg-gray-200 flex justify-center items-center">
	<div class="w-full max-w-md p-6 mx-auto bg-white rounded-md shadow-2xl">
		<h1 class="text-2xl font-medium text-gray-800 mb-6">Forgot Password</h1>
		<form on:submit|preventDefault={resetPassword}>
			<p class="text-base text-gray-700 mb-6">
				Please enter your email address to reset your password.
			</p>
			<div class="mb-7">
				<label class="block text-gray-700 font-medium mb-2" for="email"> Email Address </label>
				{#if errors.emailNull}
					<p class="text-red-500 text-sm italic mb-1">Email required</p>
				{:else if errors.invalidEmail}
					<p class="text-red-500 text-sm italic mb-1">Invalid email</p>
				{/if}
				<input
					class="form-input rounded-md shadow-sm w-full"
					type="text"
					id="email"
					name="email"
					placeholder="you@example.com"
					bind:value={email}
				/>
			</div>
			<div class="flex items-center justify-between">
				<button class="btn btn-primary  text-white font-medium py-2 px-4 rounded-md" type="submit"
					>Reset Password</button
				>
				<a href="/login" class="btn btn-error text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>

<!-- <div class="min-h-screen hero bg-base-200 mx-2">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl my-2">Forgot Password</h1>
		<form class="form-control" on:submit|preventDefault={resetPassword}>
			<p class="text-base my-2">Please enter your email address to reset your password</p>
			<div class="my-5">
				<h1>Email</h1>
				<input
					class="input input-bordered"
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
				<a href="/login" class="btn btn-error text-white">Cancel</a>
			</div>
		</form>
	</div>
</div> -->
