<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, doc } from 'firebase/firestore';

	/** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

	let news = null;

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
	}

	getNews();
</script>

<svelte:head>
	<title>News - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

{#if news}
	<main class="p-8 w-full">
		<div class="pb-10">
			<div class="text-md breadcrumbs">
				<ul>
					<li><a href="/" class="hover:underline hover:text-blue-700">Home</a></li>
					<li><a href="/news" class="hover:underline hover:text-blue-700">News</a></li>
					<li>{news.titleDisplay}</li>
				</ul>
			</div>
		</div>
		<div>
			<section class="pb-11">
				<h1 class="text-4xl font-bold pb-5">{news.titleDisplay}</h1>
				<div class="flex items-center mt-2">
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
					<p>
						<span
							class="tooltip"
							data-tip="{news.dateCreated.toDate().toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})} {news.dateCreated
								.toDate()
								.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}"
							>{news.dateCreated.toDate().toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})}</span
						>
						by Admin | Last Updated
						<span
							class="tooltip"
							data-tip="{news.dateModified.toDate().toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})} {news.dateModified
								.toDate()
								.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}"
							>{news.dateModified.toDate().toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})}</span
						>
					</p>
				</div>
				<div class="divider" />
				<div class="flex flex-col justify-between gap-10 md:flex-row overflow-x-auto">
					<article class="max-w-7xl text-justify" style="white-space:pre-wrap">
						<p class="pt-8">{news.content}</p>
					</article>
					{#if news.imageURL !== ''}
						<div>
							<img src={news.imageURL} alt="news_image" class="max-h-96 max-w-md" />
						</div>
					{/if}
				</div>
			</section>
		</div>

		<div class="flex flex-row justify-end">
			<a href="/news" class="btn btn-primary">Back</a>
		</div>
	</main>
{/if}
