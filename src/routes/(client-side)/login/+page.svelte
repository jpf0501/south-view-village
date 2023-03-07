<script>
	import { auth } from '$lib/firebase/client.js';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	let user = '';
	let password = '';

	async function submitHandler() {
		// console.log(user),
		// console.log(password)
		try {
			const cred = await signInWithEmailAndPassword(auth, user, password);
			toast.success('Login Success!')
			goto('/admin');
		} catch (error) {
			console.log(error);
			toast.error("Invalid Email or Password")
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
				To create an account, you can either go <a href="/register" class="text-blue-700 hover:text-blue-500">here</a> and wait for verification, or contact a Southview Homes 3 committee member for account creation request and
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
					<a href="/forgot-password" class="mx-auto mt-6 hover:underline">Forgot Password?</a>
				</div>
			</div>
		</form>
	</div>
</div>
