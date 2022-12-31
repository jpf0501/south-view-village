<script>
	import { page } from '$app/stores';
	$: pathname = $page.url.pathname;
</script>

<nav class="tabs tabs-boxed">
	<a class="font-medium tab tab-lg" href="/admin" class:tab-active={pathname === '/admin'}>Dashboard</a>
	<a class="font-medium tab tab-lg" href="/admin/accounts" class:tab-active={pathname === '/admin/accounts'}
		>Accounts</a
	>
	<a class="font-medium tab tab-lg" href="/admin/bookings" class:tab-active={pathname === '/admin/bookings'}>Booking</a>
	<a class="font-medium tab tab-lg" href="/admin/calendar" class:tab-active={pathname === '/admin/calendar'}
		>Calendar</a
	>
	<a class="font-medium tab tab-lg" href="/admin/news" class:tab-active={pathname === '/admin/news'}>News</a>
	<a class="font-medium tab tab-lg" href="/admin/payment" class:tab-active={pathname === '/admin/payment'}>Payment</a>
	<a class="font-medium tab tab-lg" href="/" class:tab-active={pathname === '/'}
			>Go Back</a
		>
</nav>
