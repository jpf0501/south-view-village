<script>
	import Header from "./Header.svelte";


	import Navbar from "./Navbar.svelte";
    
</script>
<main class="flex flex-col min-h-full bg-white">
	<div class=" bg-gray-100 mx-8 my-5">
		<Header/>
		<Navbar/>

	<slot/>
	</div>
	

</main>
	