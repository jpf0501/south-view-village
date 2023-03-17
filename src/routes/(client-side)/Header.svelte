<script>
	import { userStore } from '$lib/store.js';
	import { db } from '$lib/firebase/client.js';
	import { goto } from '$app/navigation';
	import { onSnapshot, doc } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import AccountButton from './AccountButton.svelte';

	let user = '';
	let unsubscribe = () => {};

	async function getUser() {
		if (!$userStore) {
			return;
		}
		unsubscribe();
		unsubscribe = onSnapshot(doc(db, 'accounts', $userStore.uid), (doc) => {
			user = doc.data();
		});
	}
	$: if ($userStore) {
		getUser();
		onDestroy(() => unsubscribe());
	} else if ($userStore === null) {
		goto('/');
	}
</script>

<div class="navbar bg-base-100 fixed top-0 z-50 drop-shadow-2xl">
	<div class="navbar-start">
		<div class="dropdown">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
						clip-rule="evenodd"
					/>
				</svg>
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li><a href="/committee">Committee</a></li>
				<li><a href="/news">News</a></li>
				<li><a href="/calendar">Calendar</a></li>
				<li><a href="/reservation">Reservation</a></li>
				{#if $userStore}
					<li><a href="/complaint">Complaint</a></li>
				{/if}
			</ul>
		</div>
		<a href="/" class="btn btn-ghost normal-case text-xl"
			><div class="flex items-center">
				<img class="h-10 w-23 rounded-full mr-2" src="/logo.png" alt="Southview Homes 3 Logo" />
				<h1 class="text-xl font-bold">Southview Homes 3</h1>
			</div></a
		>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/committee">Committee</a></li>
			<li><a href="/news">News</a></li>
			<li><a href="/calendar">Calendar</a></li>
			<li><a href="/reservation">Reservation</a></li>
			{#if $userStore}
				<li><a href="/complaint">Complaint</a></li>
			{/if}
		</ul>
	</div>
	<div class="navbar-end">
		<!-- asd -->
		<AccountButton></AccountButton>
	</div>
</div>
