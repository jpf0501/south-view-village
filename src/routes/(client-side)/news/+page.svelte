<script>
	import { getDocs, deleteDoc, query, collection, orderBy, limit } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { dateObjToISO8601 } from '$lib/dateUtils';

	let listOfNews = [];
	let newsQuery = query(collection(db, 'news'), orderBy('dateCreated', 'desc'), limit(10));

	async function getNews(newsQuery) {
		const newsSnapshot = await getDocs(newsQuery);
		listOfNews = newsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));
	}

	async function deleteExpiredNews() {
		const checkExpiredNewsSnapshot = await getDocs(collection(db, 'news'));
		const currentDate = new Date();
		const currentDateString = dateObjToISO8601(currentDate);
		// console.log(currentDateString)
		checkExpiredNewsSnapshot.forEach(async (doc) => {
			const expirationDate = doc.data().expiration;
			if (expirationDate <= currentDateString) {
				try {
					await deleteDoc(doc.ref);
				} catch (error) {
					console.log('Error deleting expired news:', doc.id, error);
				}
			}
		});
	}

	deleteExpiredNews();

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
							<div class="divider w-full" />
							<article class="w-full max-w-5xl mx-auto">
								<div class="flex flex-row-2 justify-between">
									<h1 class="font-bold text-2xl py-4">{news.titleDisplay}</h1>
									<div class="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="w-6 h-6 mr-2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<h1
											class="tooltip"
											data-tip="{news.dateCreated.toDate().toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} {news.dateCreated
												.toDate()
												.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}"
										>
											{news.dateCreated.toDate().toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}
										</h1>
									</div>
								</div>
								<p class="py-10 text-justify" style="white-space:pre-wrap">
									{news.content.substring(0, 250) + '...'}
								</p>
								<a href={'/news/entry/' + news.id} class="text-blue-700 hover:text-blue-500"
									>Read more</a
								>
							</article>
							<div class="divider w-full" />
						</section>
					</td>
				</tr>
			{:else}
				<div class="flex flex-row justify-center items-center text-2xl h-96">
					<span>No News</span>
				</div>
			{/each}
		</tbody>
	</table>
</main>
