<script>
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Navbar from './Navbar.svelte';
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
			show = true;
		} else {
			await goto('/admin');
		}
	}
	$: {
		if ($userStore === null) {
			// checkIfAdmin($userStore.uid)
			show = true;
			goto('/');
		} else if ($userStore) {
			checkIfAdmin($userStore.uid);
		}
	}
</script>

{#if !show}
	Loading
{:else}
	<Header/>
	<div class="pt-10">
		<slot/>
	</div>
	<Footer/>
{/if}
