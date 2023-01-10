<script>
	import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfEvents = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let eventQuery = query(collection(db, 'event'));

	async function getEvents(eventQuery) {
		const unsubscribe = onSnapshot(eventQuery, (querySnapshot) => {
			listOfEvents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		eventQuery = query(collection(db, 'event'), orderBy(sortByField, 'asc'));
	}

	async function searchEvents() {
		let searchByValueCase = searchByValue.toLowerCase();
		eventQuery = query(
			collection(db, 'event'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	$: getEvents(eventQuery);
</script>

<svelte:head>
	<title>Manage Events - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Events</h1>
	<div class="flex justify-between">
		<form on:submit|preventDefault={searchEvents}>
			<select bind:value={searchByField} required>
				<option value="" disabled selected>Search Filter</option>
				<option value="title">Title</option>
				<option value="date">Date</option>
			</select>
			<input type="search" placeholder="Search here" required bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy}>
			<option value="" disabled selected>Sort By</option>
			<option value="title">Title</option>
			<option value="date">Date</option>
		</select>
		<a
			class="px-1 text-sm bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/calendar/">Go Back</a
		>
	</div>

	<!-- Medium to large screen -->
	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block">
		<table class="border-2 border-black bg-white w-full text-center">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="p-3 text-sm tracking-wide">Title</th>
					<th class="p-3 text-sm tracking-wide">Description</th>
					<th class="p-3 text-sm tracking-wide">Date</th>
					<th class="p-3 text-sm tracking-wide" />
                    <th class="p-3 text-sm tracking-wide" />
				</tr>
			</thead>
			<tbody>
				{#each listOfEvents as event}
					<tr class="border-t-2 border-black">
						<td class="p-3 text-sm whitespace-nowrap">{event.titleDisplay}</td>
						<td class="p-3 text-sm whitespace-nowrap">{event.description.substring(0,50) + '...'}</td>
						<td class="p-3 text-sm whitespace-nowrap">{event.date}</td>
						<td class="p-3 text-sm whitespace-nowrap">
							<a
								href={'/admin/calendar/entries/edit/' + event.id}
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
		{#each listOfEvents as user}
			<div class="bg-white space-y-3 p-4 border-2 border-black">
				<div class="flex items-center space-x-2  text-sm">
					<div>
						<span class="font-bold text-sm">Name: </span>
						{user.firstNameDisplay + ' ' + user.lastNameDisplay}
					</div>
					<div>
						<span class="font-bold text-sm">Role: </span>
						{user.role}
					</div>
				</div>
				<div>
					<span class="font-bold text-sm">Address: </span>
					{'Block ' +
						user.addressBlock +
						' Lot ' +
						user.addressLot +
						' ' +
						user.addressStreet +
						' Street'}
				</div>
				<div>
					<span class="font-bold text-sm">Email: </span>
					{user.email}
				</div>
				<div class="flex justify-end">
					<a
						href={'/admin/accounts/edit/' + user.id}
						class="text-blue-500 font-bold hover:underline">Edit</a
					>
				</div>
			</div>
			<br />
		{/each}
	</div>
</div>
