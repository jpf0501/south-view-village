<script>
	import { userStore } from '$lib/store.js';
	import { auth, db } from '$lib/firebase/client.js';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { getDoc, doc } from 'firebase/firestore';
	import toast from 'svelte-french-toast';

	async function logOut() {
		try {
			await signOut(auth);
			toast.success('Signed Out!')
			goto('/');
		} catch (error) {
			console.log(error);
			toast.error('Error in Signing Out!');
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

<div class="flex justify-between items-center px-4 py-2 bg-base-100">
	<div class="flex items-center">
		<img class="h-10 w-10 rounded-full mr-2" src="/logo.png" alt="Southview Homes 3 Logo" />
		<h1 class="text-xl font-semibold">Southview Homes 3</h1>
	</div>
	<div class="flex items-center">
		<p class="mx-2 font-bold">{user.firstNameDisplay}</p>
		<button class="gap-1 btn btn-outline" on:click={logOut}>Logout </button>
	</div>
</div>
