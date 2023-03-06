<script>
	import { userStore } from '$lib/store.js';
	import { getDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client.js';
	import { page } from '$app/stores';

	let user = '';
	let isDropdownOpen = false;

	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}

	$: getUser();
	$: pathname = $page.url.pathname;
</script>

<nav class="tabs tabs-boxed flex flex-wrap justify-center sm:justify-start relative">

	<!-- large screen -->
	<div class="hidden sm:block">
		<a class="font-medium tab tab-lg py-2 px-4" href="/" class:tab-active={pathname === '/'}>Home</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/calendar"
			class:tab-active={pathname === '/calendar'}>Calendar</a
		>
		<a class="font-medium tab tab-lg py-2 px-4" href="/news" class:tab-active={pathname === '/news'}
			>News</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/community"
			class:tab-active={pathname === '/community'}>Community</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/committee"
			class:tab-active={pathname === '/committee'}>Committee</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/reservation"
			class:tab-active={pathname === '/reservation'}>Reservation</a
		>

		{#if $userStore}
			<a
				class="font-medium tab tab-lg py-2 px-4"
				href="/profile"
				class:tab-active={pathname === '/profile'}>Profile</a
			>
		{/if}
	</div>

	<!--  small screen -->
	<button
		class="block sm:hidden font-medium tab tab-lg py-2 px-4"
		on:click={() => (isDropdownOpen = !isDropdownOpen)}
	>
		<svg
			class="w-6 h-6 inline-block ml-2"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	</button>
	{#if isDropdownOpen}
		<div class="sm:hidden absolute top-full left-0 right-0 z-20">
			<div class="bg-white rounded-md shadow-md">
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/"
					class:tab-active={pathname === '/'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Home</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/calendar"
					class:tab-active={pathname === '/calendar'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Calendar</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/news"
					class:tab-active={pathname === '/news'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>News</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/community"
					class:tab-active={pathname === '/community'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Community</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/committee"
					class:tab-active={pathname === '/committee'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Committee</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/reservation"
					class:tab-active={pathname === '/reservation'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Reservation</a
				>

				{#if $userStore}
					<a
						class="block font-medium tab tab-lg py-2 px-4 border-b"
						href="/profile"
						class:tab-active={pathname === '/profile'}
						on:click={() => (isDropdownOpen = !isDropdownOpen)}>Profile</a
					>
				{/if}
			</div>
		</div>
	{/if}
</nav>
