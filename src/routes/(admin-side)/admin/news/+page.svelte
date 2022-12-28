<script>
	import { onSnapshot, query, collection, snapshotEqual, orderBy } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfNews = [];

	const newsQuery = query(collection(db, 'news'));
	const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
		listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());

	let newsSort = '';

	async function sortBy() {
		if (newsSort == 'Title') {
			const sortByTitleQuery = query(collection(db, 'news'), orderBy('title', 'asc'));
			const unsubscribe = onSnapshot(sortByTitleQuery, (querySnapshot) => {
				listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
			// placeholder for timestamp sort
		} else if (newsSort == 'Date') {
			const sortByDateQuery = query(collection(db, 'news'), orderBy('content', 'asc'));
			const unsubscribe = onSnapshot(sortByDateQuery, (querySnapshot) => {
				listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		} else if (newsSort == 'Update') {
			const sortByUpdateQuery = query(collection(db, 'news'), orderBy('content', 'desc'));
			const unsubscribe = onSnapshot(sortByUpdateQuery, (querySnapshot) => {
				listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		}
	}
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">News</h1>
	<div class="flex justify-between">
		<h1 class="text-xl font-semibold">Entries</h1>
		<input type="search" placeholder="Search here" />
		<select bind:value={newsSort} on:click={sortBy} name="" id="">
			<option value="" disabled selected>Sort By</option>
			<option value="Title">Title</option>
			<option value="Date">Date Created</option>
			<option value="Update">Last Updated</option>
		</select>
		<a
			class="px-1 text-sm bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/news/create">Add Entry</a
		>
	</div>

	<!-- Medium to large screen -->
	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block text-center">
		<table class="border-2 border-black bg-white w-full">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="w-1/4 p-3 text-sm tracking-wide">Title</th>
					<th class="w-1/4 p-3 text-sm tracking-wide">Date Created</th>
					<th class="w-1/4 p-3 text-sm tracking-wide">Last Updated</th>
					<th class="w-1/4 p-3 text-sm tracking-wide" />
				</tr>
			</thead>
			<tbody>
				{#each listOfNews as news}
					<tr class="border-t-2 border-black">
						<td class="w-1/4 p-3 text-sm whitespace-nowrap">{news.title}</td>
						<td class="w-1/4 p-3 text-sm whitespace-nowrap">{news.dateCreated.toDate().toLocaleDateString() + ' ' + news.dateCreated.toDate().toLocaleTimeString()}</td>
						<td class="w-1/4 p-3 text-sm whitespace-nowrap">{news.dateModified.toDate().toLocaleDateString() + ' ' + news.dateModified.toDate().toLocaleTimeString()}</td>
						<td class="w-1/4 p-3 text-sm whitespace-nowrap">
							<a
								href={'/admin/news/edit/' + news.id}
								class="font-bold text-blue-500 hover:underline">Edit</a
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Small screen -->
	<div class="bg-gray-300 my-5 p-5  selection:grid grid-cols-1 gap-4 md:hidden rounded-lg shadow">
		{#each listOfNews as news}
			<div class="bg-white space-y-3 p-4 border-2 border-black">
				<div class="flex items-center space-x-2  text-sm">
					<div>
						<span class="font-bold text-sm">Title: </span>
						{news.title}
					</div>
					<div>
						<a
							href={'/admin/news/edit/' + news.id}
							class="text-blue-500 font-bold hover:underline">Edit</a
						>
					</div>
				</div>
				<div>
					<span class="font-bold text-sm">Date Created: </span>
					{news.dateCreated.toDate().toLocaleDateString() + ' ' + news.dateCreated.toDate().toLocaleTimeString()}
				</div>
			</div>
			<br />
		{/each}
	</div>
</div>