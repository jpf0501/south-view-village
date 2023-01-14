<script>
	import { onSnapshot, query, collection, snapshotEqual, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfNews = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let newsQuery = query(collection(db, 'news'));

	async function getNews(newsQuery) {
		const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
			listOfNews = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		newsQuery = query(collection(db, 'news'), orderBy(sortByField, 'asc'));
	}

	async function searchNews() {
		let searchByValueCase = searchByValue.toLowerCase();
		if (searchByValue == '') {
			newsQuery = query(collection(db, 'news'));
		} else {
			newsQuery = query(
				collection(db, 'news'),
				where(searchByField, '>=', searchByValueCase),
				where(searchByField, '<=', searchByValueCase + '~')
			);
		}
	}

	$: getNews(newsQuery);
</script>

<svelte:head>
	<title>News - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">News</h1>
	<div class="flex justify-between">
		<form on:submit|preventDefault={searchNews}>
			<select bind:value={searchByField} required>
				<option value="" disabled selected>Search Filter</option>
				<option value="title">Title</option>
			</select>
			<input type="search" placeholder="Search here" bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy}>
			<option value="" disabled selected>Sort By</option>
			<option value="title">Title</option>
			<option value="dateCreated">Date Created</option>
			<option value="dateModified">Last Updated</option>
		</select>
		<a
			class="px-1 text-sm bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/news/create">Add Entry</a
		>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full p-6 mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th class="text-lg">Title</th>
						<th class="text-lg">Date Created</th>
						<th class="text-lg">Last Updated</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{#each listOfNews as news}
						<tr class="hover">
							<th>{news.titleDisplay}</th>
							<td
								>{news.dateCreated.toDate().toLocaleDateString() +
									' ' +
									news.dateCreated.toDate().toLocaleTimeString()}</td
							>
							<td
								>{news.dateModified.toDate().toLocaleDateString() +
									' ' +
									news.dateModified.toDate().toLocaleTimeString()}</td
							>
							<td
								><a
									href={'/admin/news/edit/' + news.id}
									class="font-bold text-blue-500 hover:underline">Edit</a
								></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#each listOfNews as news}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{news.titleDisplay}</h2>
					<p class="my-1">
						Date Created: {news.dateCreated.toDate().toLocaleDateString() +
							' ' +
							news.dateCreated.toDate().toLocaleTimeString()}
					</p>
					<p class="my-1">
						Last Updated: {news.dateModified.toDate().toLocaleDateString() +
							' ' +
							news.dateModified.toDate().toLocaleTimeString()}
					</p>
					<div class="card-actions justify-end">
						<a href={'/admin/news/edit/' + news.id} class="btn btn-primary hover:underline">Edit</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
