<script>
	import { userStore } from '$lib/store.js';
	import { auth, db } from '$lib/firebase/client.js';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { getDoc, doc } from 'firebase/firestore';

	async function logOut() {
		try {
			await signOut(auth);
			goto('/');
		} catch (error) {
			console.log(error);
			alert('Signing out error');
		}
	}

	let user = '';

	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}
	$: if ($userStore) {
		getUser();
	} else if ($userStore === null) {
		goto('/');
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<img
			class="mask mask-circle"
			src="https://i.ibb.co/Q6Jmgpt/logo-01.jpg" 
			alt="Southview Homes 3 Logo"
		/>
		<h1 class="font-semibold text-xl">Southview Homes 3</h1>
	</div>
	<div class="flex-none">
		<p class="p-3 mx-5 font-bold">Hello, {user.firstNameDisplay}</p>
		<button on:click={logOut} class="gap-2 btn btn-outline"
			>Logout<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		</button>
	</div>
</div>
