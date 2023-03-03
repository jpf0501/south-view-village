<script>
	import { page } from '$app/stores';
	let isDropdownOpen = false;
	$: pathname = $page.url.pathname;
</script>

<nav class="tabs tabs-boxed flex flex-wrap justify-center sm:justify-start relative">
	<!-- large screen -->
	<div class="hidden md:block">
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin"
			class:tab-active={pathname === '/admin'}>Dashboard</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin/accounts"
			class:tab-active={pathname === '/admin/accounts'}>Accounts</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin/bookings"
			class:tab-active={pathname === '/admin/bookings'}>Booking</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin/calendar"
			class:tab-active={pathname === '/admin/calendar'}>Calendar</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin/news"
			class:tab-active={pathname === '/admin/news'}>News</a
		>
		<a
			class="font-medium tab tab-lg py-2 px-4"
			href="/admin/payment"
			class:tab-active={pathname === '/admin/payment'}>Payment</a
		>
	</div>

	<!-- small screen -->
	<button
		class="font-medium tab tab-lg py-2 px-4 md:hidden"
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
		<div class="absolute top-full left-0 right-0 z-20 md:hidden">
			<div class="bg-white rounded-md shadow-md">
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/admin"
					class:tab-active={pathname === '/admin'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Dashboard</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/admin/accounts"
					class:tab-active={pathname === '/admin/accounts'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Accounts</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/admin/bookings"
					class:tab-active={pathname === '/admin/bookings'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Booking</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/admin/calendar"
					class:tab-active={pathname === '/admin/calendar'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Calendar</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4 border-b"
					href="/admin/news"
					class:tab-active={pathname === '/admin/news'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>News</a
				>
				<a
					class="block font-medium tab tab-lg py-2 px-4"
					href="/admin/payment"
					class:tab-active={pathname === '/admin/payment'}
					on:click={() => (isDropdownOpen = !isDropdownOpen)}>Payment</a
				>
			</div>
		</div>
	{/if}
</nav>
