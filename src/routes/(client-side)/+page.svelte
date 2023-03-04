<script>
	import { onSnapshot, query, collection, orderBy, limit } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfNews = [];
	let newsQuery = query(collection(db, 'news'), orderBy('dateCreated', 'desc'), limit(3));

	async function getNews(newsQuery) {
		const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
			listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	$: getNews(newsQuery);
</script>

<svelte:head>
	<title>Southview Homes 3 - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<!-- Hero -->
<div class="min-h-[80vh] hero" style="background-image: url(/images/banner.jpg);">
	<div class="hero-overlay bg-opacity-80" />
	<div class="text-center hero-content text-neutral-content">
		<div class="max-w-ct">
			<h2 class="mb-5 text-2xl md:text-5xl font-bold drop-shadow-xl">WELCOME TO</h2>
			<h1 class="mb-10 text-3xl md:text-6xl font-bold">SOUTHVIEW HOMES 3</h1>
		</div>
	</div>
</div>
<!-- end hero -->

<!-- community -->
<div class="hero py-16">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<img src="/images/house.jpg" class="w-full max-w-md mask mask-circle" alt="housing"/>
		<div class="p-8">
			<h1 class="text-5xl font-bold pb-7 text-center lg:text-left">A Welcoming Community</h1>
			<p class="py-6 text-justify">Located at the heart of San Pedro, Laguna, Southview Homes 3 not only offers a peaceful and an easily accessible neighborhood at an affordable price, but also an organized community filled with approachable and hardworking people that keep the residents of Southview Homes 3 tightly-knit together.</p>
			<a href="/community" class="btn btn-primary mt-3">Learn More</a>
		</div>
	</div>
</div>
<!-- end committee -->

<!-- photo showcase -->
<div class="flex flex-col md:flex-row items-fit">
	<div>
		<img src="/images/playground.jpg" alt="Southview Homes 3 Residence"/>
	</div>
	<div>
		<img src="/images/amenities.jpg" alt="Southview Homes 3 Amenities"/>
	</div>
	<div>
		<img src="/images/front_gate.jpg" alt="Southview Homes 3 Front Gate"/>
	</div>
</div>
<!-- end showcase -->

<!-- news -->
<div class="flex flex-col  w-full bg-base-200">
	<div class="m-8 bg-white rounded-lg">
		<div class="flex flex-col mt-6 mx-8 mb-4">
			<h2 class="font-bold text-4xl mt-3">Recent News</h2>
				<p class="divider"></p>
				{#each listOfNews as news}
					<a href={`/news/entry/${news.id}`} class="text-blue-700">{news.titleDisplay}</a>
					<p class="divider"></p>
				{/each}
		</div>
	</div>
</div>
<!-- end news -->

<!-- clubhouse card -->
<div class="hero py-16">
	<div class="hero-content flex-col lg:flex-row">
		<img src="/images/clubhouse.jpg" class="w-full max-w-md mask mask-circle" alt="clubhouse"/>
		<div class="p-8">
			<h1 class="text-5xl font-bold pb-7 text-center lg:text-left">Clubhouse Renting</h1>
			<p class="py-6 text-justify">Southview Homes 3 also offers reservations of its clubhouse facility and surrounding amenities for both residents and non-residents. Reservations can include all kinds of events - birthdays, debuts, and everything else.</p>
			<a href="/community" class="btn btn-primary mt-3">Learn More</a>
		</div>
	</div>
</div>
<!-- end clubhouse card -->