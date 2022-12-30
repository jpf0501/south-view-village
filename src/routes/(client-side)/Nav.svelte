<script>
	import { page } from '$app/stores';
	import { userStore } from '$lib/store.js';
	$: pathname = $page.url.pathname;
</script>

<nav class="tabs tabs-boxed">
	<a class="font-medium tab tab-lg" href="/" class:tab-active={pathname === '/'}>Home</a>
	<a class="font-medium tab tab-lg" href="/calendar" class:tab-active={pathname === '/calendar'}
		>Calendar</a
	>
	<a class="font-medium tab tab-lg" href="/news" class:tab-active={pathname === '/news'}>News</a>
	<a class="font-medium tab tab-lg" href="/community" class:tab-active={pathname === '/community'}
		>Community</a
	>
	<a class="font-medium tab tab-lg" href="/committee" class:tab-active={pathname === '/committee'}>Committee</a>
	<a
		class="font-medium tab tab-lg"
		href="/reservation"
		class:tab-active={pathname === '/reservation'}>Reservation</a
	>

	{#if $userStore}
		<a class="font-medium tab tab-lg" href="/payment" class:tab-active={pathname === '/payment'}
			>Payment</a
		>
		<a class="font-medium tab tab-lg" href="/profile" class:tab-active={pathname === '/profile'}
			>Profile</a
		>
	{/if}
</nav>
