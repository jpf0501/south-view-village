<script>
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Nav from './Nav.svelte';
</script>

<main class="flex flex-col min-h-full">
	<div class="sticky top-0 z-50">
		<Header />
		<Nav />
	</div>
	<slot />
	<Footer />
</main>
