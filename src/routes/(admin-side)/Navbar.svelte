<script>
	import { page } from '$app/stores';
	$: pathname = $page.url.pathname;
</script>

<nav class="ml-20 bg-gray-100">
	<a class="font-medium tab tab-lg" href="/admin" class:tab-active={pathname === '/admin'}>Dashboard</a>
	<a class="font-medium tab tab-lg" href="/admin/news" class:tab-active={pathname === '/admin/news'}
		>News</a
	>
	<a class="font-medium tab tab-lg" href="/admin/bookings" class:tab-active={pathname === '/admin/bookings'}>Bookings</a>
	<a class="font-medium tab tab-lg" href="/admin/calendar" class:tab-active={pathname === '/admin/calendar'}
		>Calendar</a
	>
	<a class="font-medium tab tab-lg" href="/admin/accounts" class:tab-active={pathname === '/admin/accounts'}>Accounts</a>
	
</nav>




