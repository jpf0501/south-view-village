<script>
	import Header from "./Header.svelte";
	import Navbar from "./Navbar.svelte";
	import LoadingScreen from "../LoadingScreen.svelte";
	import { userStore } from "$lib/store";
	import { getDoc, doc } from "firebase/firestore";
	import { db } from "$lib/firebase/client";
	import { goto } from "$app/navigation";
	
	let show = false;
	async function checkIfAdmin(id) {
		const snapshot = await getDoc(doc(db, "accounts", id))
		const role = snapshot.get("role")
		const isAdmin = "Admin" === role
		if (!isAdmin) {
			await goto("/")
		} else {
			show = true;
		}
	}
	$:{
		if ($userStore === null) {
			// checkIfAdmin($userStore.uid)
			goto("/")
		} else if ($userStore) {
			checkIfAdmin($userStore.uid)
		}
	}
</script>
{#if !show }
	<LoadingScreen/>
{:else}
	<Header/>
	<div class="pt-16">
		<slot/>
	</div>
{/if}
