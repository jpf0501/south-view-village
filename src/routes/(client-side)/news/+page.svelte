<script>
	import { getDocs, query, collection, orderBy, limit } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';


	let listOfNews = [];
	let newsQuery = query(collection(db, 'news'), orderBy('dateCreated', 'desc'), limit(10));

	async function getNews(newsQuery) {
		const newsSnapshot = await getDocs(newsQuery);
		listOfNews = newsSnapshot.docs.map((doc) => doc.data());
	}

	getNews(newsQuery);

</script>

<svelte:head>
	<title>News - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<main class="p-8">
	<h1 class="text-3xl font-bold p-4">News and Announcements</h1>
	<table class="w-full">
		<tbody>
		{#each listOfNews as news}
			<tr>
			<td>
			<section>
				<h1 class="divider w-full">
				</h1>
				<article class="w-full max-w-5xl mx-auto">
					<div class="flex flex-row-2 justify-between">
						<h1 class="font-bold text-2xl py-4">{news.titleDisplay}</h1>
						<div class="flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<h1 class="tooltip" data-tip='{news.dateCreated.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {news.dateCreated.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}'>{news.dateCreated.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</h1>
						</div>
					</div>
				<p class="py-10 text-justify" style="white-space:pre-wrap">
					{news.content.substring(0, 250) + '...'}
				</p>
				<a href={'/news/entry/' + news.id} class="text-blue-700 hover:text-blue-500">Read more</a>
				</article>
				<h1 class="divider w-full">
				</h1>
			</section>
			</td>
			</tr>
		{/each}
		</tbody>
	</table>
</main>
