<script>
	import { onSnapshot, query, collection, snapshotEqual } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfNews = [];

	const newsQuery = query(collection(db, 'news'));
	const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
		listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">News</h1>
	<div class="py-5">
		<table class="border-2 border-black bg-white w-full">
			<thead>
				<tr class="font-bold bg-gray-500">
					<th class="text-left">Name</th>
					<th class="text-left">Date</th>
					<th class="text-left">Time</th>
				</tr>
			</thead>
			<tbody>
				{#each listOfNews as news}
					<tr class="border-t-2 border-black">
						<td class="text-left">{news.title}</td>
						<td class="text-left">{news.date}</td>
						<td class="text-left">{news.time}</td>
						<a href={'/admin/news/edit/' + news.id} class="text-blue-500">Edit</a>
						<!-- <h1>{ JSON.stringify(user) }</h1> -->
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
