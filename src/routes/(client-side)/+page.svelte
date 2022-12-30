<svelte:head>
	<title>Southview Homes 3 - Official Website of Southview Homes 3 Village</title>
</svelte:head>

<!-- Hero -->
<div class="min-h-screen hero" style="background-image: url(https://i.ibb.co/gF7DhBY/010.jpg);">
	<div class="hero-overlay bg-opacity-70" />
	<div class="text-center hero-content text-neutral-content">
		<div class="max-w-ct">
			<h2 class="mb-5 text-2xl md:text-5xl font-bold ">WELCOME TO</h2>
			<h1 class="mb-5 text-3xl md:text-6xl font-bold ">SOUTHVIEW HOMES 3</h1>
		</div>
	</div>
</div>

<div class="flex flex-col md:flex-row">
	<div class="basis-1/2 flex flex-col justify-center mx-auto p-5">
		<h1 class="uppercase font-semibold text-5xl my-5">A place for everyone</h1>
		<p class="text-lg my-5">Southview Homes 3 offers a peaceful and protected neighborhood at an affordable price, which makes it the ideal place if you are looking for somewhere to settle down. </p>
		<a class="btn btn-primary btn-center w-40 my-5" href="/community">Learn More</a>
	</div>
	<!-- Carousel -->
	<div class="basis-1/2 py-4 carousel m-5">
		<div id="slide1" class="relative w-full carousel-item">
			<img src="https://i.ibb.co/k04hdhv/01.jpg" alt="" class="w-full" />
			<div class="absolute flex justify-between transform -translate-y-1/2 left-10 right-10 top-1/2">
				<a href="#slide4" class="btn btn-circle btn-outline bg-white">❮</a>
				<a href="#slide2" class="btn btn-circle btn-outline bg-white">❯</a>
			</div>
		</div>
		<div id="slide2" class="relative w-full carousel-item">
			<img src="https://i.ibb.co/Gpj0ww5/04.jpg" alt="" class="w-full" />
			<div class="absolute flex justify-between transform -translate-y-1/2 left-10 right-10 top-1/2">
				<a href="#slide1" class="btn btn-circle btn-outline bg-white">❮</a>
				<a href="#slide3" class="btn btn-circle btn-outline bg-white">❯</a>
			</div>
		</div>
		<div id="slide3" class="relative w-full carousel-item">
			<img src="https://i.ibb.co/QHd6Ktg/03.jpg" alt="" class="w-full" />
			<div class="absolute flex justify-between transform -translate-y-1/2 left-10 right-10 top-1/2">
				<a href="#slide2" class="btn btn-circle btn-outline bg-white">❮</a>
				<a href="#slide4" class="btn btn-circle btn-outline bg-white">❯</a>
			</div>
		</div>
		<div id="slide4" class="relative w-full carousel-item">
			<img src="https://i.ibb.co/bRt1PBC/09.jpg" alt="" class="w-full" />
			<div class="absolute flex justify-between transform -translate-y-1/2 left-10 right-10 top-1/2">
				<a href="#slide3" class="btn btn-circle btn-outline bg-white">❮</a>
				<a href="#slide1" class="btn btn-circle btn-outline bg-white">❯</a>
			</div>
		</div>
	</div>

</div>
