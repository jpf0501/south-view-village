<script>
	import { auth } from '$lib/firebase/client.js';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';

	let user = '';
	let password = '';

	async function submitHandler() {
		// console.log(user),
		// console.log(password)
		try {
			const cred = await signInWithEmailAndPassword(auth, user, password);
			// console.log(cred);
			alert('Login success');
			goto('/admin');
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}
</script>

<svelte:head>
	<title>Login - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200">
	<div class="flex-col hero-content lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Login now!</h1>
			<p class="py-6">
				To create an account, please contact a Southview Homes 3 committee member for requests and
				other inquiries.
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
					<a href="createAccount" class="mx-auto my-3 hover:underline">Create Account</a>
					<a href="/forgot_Password" class="mx-auto my-3 hover:underline">Forgot Password?</a>
				</div>
			</div>
		</form>
	</div>
</div>
