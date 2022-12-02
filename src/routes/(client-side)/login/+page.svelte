<script>
	import { auth } from '$lib/firebase/client.js';
	import { signInWithEmailAndPassword } from 'firebase/auth';

	let user = '';
	let password = '';

	async function submitHandler(){
		// console.log(user),
		// console.log(password)
		try {
			const cred = await signInWithEmailAndPassword(auth, user, password);
			// console.log(cred);
			alert("Login success");
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}
</script>

<div class="min-h-screen hero bg-base-200">
	<div class="flex-col hero-content lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Login now!</h1>
			<p class="py-6">
				Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
				quasi. In deleniti eaque aut repudiandae et a id nisi.
			</p>
		</div>
		<form
		on:submit|preventDefault={submitHandler}
		class="flex-shrink-0 w-full max-w-sm shadow-2xl card bg-base-100">
			<div class="card-body">
				<div class="form-control">
					<label for="email" class="label">
						<span class="label-text">Email</span>
					</label>
					<input type="email" placeholder="email" name="email" class="input input-bordered" required bind:value={user}/>
				</div>
				<div class="form-control">
					<label for="password" class="label">
						<span class="label-text">Password</span>
					</label>
					<input type="password" placeholder="password" name="password" class="input input-bordered" required bind:value={password}/>
				</div>
				<div class="mt-6 form-control">
					<button class="btn btn-primary">Login</button>
				</div>
			</div>
		</form>
	</div>
</div>
