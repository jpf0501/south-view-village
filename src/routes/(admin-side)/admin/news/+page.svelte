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

<main>
	<div>
		<div>
			<h1 class="text-3xl font-bold mt-5 mb-16 ml-5">News</h1>
		</div>
		<div>
			<div class="px-10 py-5">
				<table class="border-2 border-black w-full">
					<thead>
						<tr class="font-bold bg-gray-500">
							<th class="text-left text-base">Name</th>
							<th class="text-left text-base">Date</th>
							<th class="text-left text-base">Time</th>
						</tr>
					</thead>
					<tbody>
						{#each listOfNews as news}
							<tr class="text-base text-center border-t-2 border-black">
								<td class="text-left text-base bg-gray-300">{news.title}</td>
								<td class="text-left text-base bg-gray-300">{news.date}</td>
								<td class="text-left text-base bg-gray-300">{news.time}</td>
								<a class="" href={'/admin/news/edit/' + news.id}>Edit</a>
								<!-- <h1>{ JSON.stringify(user) }</h1> -->
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</main>
