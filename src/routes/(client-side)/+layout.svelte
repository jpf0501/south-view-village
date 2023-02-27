<script>
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Nav from './Nav.svelte';
	import { userStore } from '$lib/store';
	import { getDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';

	let show = false;
	async function checkIfAdmin(id) {
		const snapshot = await getDoc(doc(db, 'accounts', id));
		const role = snapshot.get('role');
		const isAdmin = 'Admin' === role;
		if (!isAdmin) {
			await goto('/');
		} else {
			await goto('/admin');
			show = true;
		}
	}

	$: {
		if ($userStore === null) {
			goto('/');
		} else if ($userStore) {
			checkIfAdmin($userStore.uid);
		}
	}
</script>

{#if !show}
	Loading
{:else}
	<main class="flex flex-col min-h-full">
		<Header />
		<Nav />
		<slot />
		<Footer />
	</main>
{/if}
