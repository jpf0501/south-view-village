<script>
	import { auth } from '$lib/firebase/client.js';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { db } from '$lib/firebase/client';
	import { getDocs, query, collection, where } from 'firebase/firestore';
	import { sendEmail } from '$lib/utils';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	let user = '';
	let password = '';
	let remainingTime = 0;
	let loginAttempts = 0;
	let remainingAttempts = 6;
	let loginDisabled = false;

	async function submitHandler() {
		const accountsQuery = query(collection(db, 'accounts'), where('email', '==', user));
		const accountsSnapshot = await getDocs(accountsQuery);

		if (loginDisabled) {
			if (remainingTime > 0) {
				toast.error(`Login is temporarily disabled. Please try again in ${remainingTime} seconds.`);
			} else {
				toast.error('Login is temporarily disabled. Please try again later.');
			}
			password = '';
			return;
		}

		try {
			const cred = await signInWithEmailAndPassword(auth, user, password);
			toast.success('Login Success!');
			goto('/admin');
		} catch (error) {
			// console.log(user);
			// console.log(password);
			console.log(error);
			if (error.code === 'auth/network-request-failed') {
				toast.error('Network error. Please check your internet connection.');
			} else if (error.code === 'auth/too-many-requests') {
				toast.error(
					'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.'
				);
			} else {
				loginAttempts++;
				remainingAttempts = 6 - loginAttempts;
				toast.error(`Invalid email or password. ${remainingAttempts} attempts left.`);
				if (loginAttempts >= 6) {
					loginDisabled = true;
					remainingTime = 60;
					const timer = setInterval(() => {
						remainingTime--;
						if (remainingTime <= 0) {
							clearInterval(timer);
							loginDisabled = false;
							loginAttempts = 0;
							remainingAttempts = 5;
						}
					}, 1000);
				}

				if (remainingAttempts === 0) {
					if (accountsSnapshot.docs.length > 0) {
						await sendEmail({
							to: user,
							subject: 'Southview Homes 3 - Unauthorized Login Attempt on your Account',
							html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p>Unathorized Login</p>
				<p>Dear Resident,</p>
				<p>Someone is trying to access your account. Kindly check and update your account to avoid unwanted access to your account.</p>
				<p>Best regards,</p>
				<p>Soutview Homes 3</p>
				`
						});
					}
				}
				password = '';
			}
		}
	}
</script>

<svelte:head>
	<title>Login - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200 pt-6">
	<div class="flex-col hero-content lg:flex-row-reverse gap-11">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold pb-6">Login</h1>
			<p class="py-6">
				To create an account, you can either go <a
					href="/register"
					class="text-blue-700 hover:text-blue-500">here</a
				> and wait for verification, or contact a Southview Homes 3 committee member for account creation
				request and other inquiries.
			</p>
		</div>
		<form
			on:submit|preventDefault={submitHandler}
			class="flex-shrink-0 w-full max-w-sm shadow-2xl card bg-base-100"
		>
			<div class="card-body">
				<div class="form-control">
					<label for="email" class="label">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						placeholder="Email"
						name="email"
						class="input input-bordered"
						required
						bind:value={user}
					/>
				</div>
				<div class="form-control">
					<label for="password" class="label">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						placeholder="Password"
						name="password"
						class="input input-bordered"
						required
						bind:value={password}
					/>
				</div>
				<div class="mt-6 form-control">
					<button class="btn btn-primary">Login</button>
					<a href="/forgot-password" class="mx-auto mt-6 hover:underline">Forgot Password?</a>
				</div>
			</div>
		</form>
	</div>
</div>
