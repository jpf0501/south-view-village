<script>
    import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Nav from './Nav.svelte';
</script>


<main class="flex flex-col min-h-full">
	<Header />
	<Nav />
	<slot/>
	<Footer />
</main>

