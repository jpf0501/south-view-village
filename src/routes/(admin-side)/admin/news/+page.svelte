<script>
	import { getDocs, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';

	let listOfNews = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let newsQuery = query(collection(db, 'news'));

	async function changeSortBy() {
		const order = sortByField === 'title' ? 'asc' : 'desc';
		newsQuery = query(collection(db, 'news'), orderBy(sortByField, order));
	}

	async function searchNews() {
		let searchByValueCase = searchByValue.toLowerCase();
		newsQuery = query(
			collection(db, 'news'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	async function resetButton() {
		newsQuery = query(collection(db, 'news'));
		searchByValue = '';
	}

	async function getNews(newsQuery) {
		const newsSnapshot = await getDocs(newsQuery);
		listOfNews = newsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));
	}

	getNews(newsQuery);
</script>

<svelte:head>
	<title>News - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">News</h1>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchNews}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="title">Title</option>
					<!-- <option value="dateCreated">Date Created</option>
					<option value="dateModified">Last Updated</option> -->
				</select>
				<input
					type="search"
					placeholder="Search here"
					bind:value={searchByValue}
					class="input input-bordered"
				/>
			</form>
			<button on:click={resetButton} class="btn btn-primary my-4 mx-2">Reset</button>
		</div>

		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="title">Title</option>
			<option value="dateCreated">Date Created</option>
			<option value="dateModified">Last Updated</option>
		</select>
		<a class="btn btn-primary my-4" href="/admin/news/create">Add News</a>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Title</th>
						<th class="text-lg">Date Created</th>
						<th class="text-lg">Last Updated</th>
						<th />
					</tr>
				</thead>

				<tbody>
					{#each listOfNews as news, i}
						<tr class="hover">
							<td>{i + 1}</td>
							<td>{news.titleDisplay}</td>
							<td
								>{news.dateCreated
									.toDate()
									.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
									' at ' +
									news.dateCreated
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							>
							<td
								>{news.dateModified
									.toDate()
									.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
									' at ' +
									news.dateModified
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							>
							<td>
								<a href={'/admin/news/edit/' + news.id} class="btn glass text-white"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										><path
											d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
										/></svg
									></a
								>
							</td>
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
					<div>
						<span class="my-1 font-bold">Date Created:</span>
						{news.dateCreated
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							news.dateCreated
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
					</div>
					<div>
						<span class="my-1 font-bold">Last Updated:</span>
						{news.dateModified
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							news.dateModified
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
					</div>
					<div class="card-actions justify-end">
						<a href={'/admin/news/edit/' + news.id} class="btn glass text-white"
							><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
								/></svg
							></a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
