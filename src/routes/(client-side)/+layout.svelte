<script>
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
</script>

<Header/>
<div class="pt-16">
	<slot/>
</div>
<Footer/>
