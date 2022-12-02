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
	<a class="font-medium tab tab-lg" href="/hoas" class:tab-active={pathname === '/hoas'}>HOAs</a>
	<a class="font-medium tab tab-lg" href="/about" class:tab-active={pathname === '/about'}>About</a>

	
	{#if $userStore}
	<a class="font-medium tab tab-lg" href="/payment" class:tab-active={pathname === '/payment'}>Payment</a>
	{/if}
</nav>
