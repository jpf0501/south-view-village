<script>
	import { onSnapshot, query, collection, snapshotEqual, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfNews = [];
	let newsQuery = query(collection(db, 'news'), orderBy('dateCreated', 'desc'));

	async function getNews(newsQuery) {
		const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
			listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	$: getNews(newsQuery);

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
				<h1 class="divider">
				</h1>
				<article class="w-full max-w-5xl mx-auto">
					<div class="flex flex-row-2 justify-between">
						<h1 class="font-bold text-2xl p-4">{news.titleDisplay}</h1>
						<h1 class="p-4">Posted {news.dateCreated.toDate().toLocaleDateString()}</h1>
					</div>
				<p class="p-4 text-justify" style="white-space:pre-wrap">
					{news.content.substring(0, 250) + '...'}
				</p>
				<a href={'/news/entry/' + news.id} class="link link-hover link-info">Read more</a>
				</article>
				<h1 class="px-4 divider">
				</h1>
			</section>
			</td>
			</tr>
		{/each}
		</tbody>
	</table>
</main>
