<script>
	import '../app.postcss';
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Nav from './Nav.svelte';
</script>

<svelte:head>
	<title>Southview Village</title>
</svelte:head>

<main class="flex flex-col min-h-full">
	<Header />
	<Nav />
	<slot />
	<Footer />
</main>
