<script>
	import { onSnapshot, query, collection, snapshotEqual, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfUsers = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let accountsQuery = query(collection(db, 'accounts'));

	async function getAccounts(accountsQuery) {
		// if (sortByField) accountsQuery = query(collection(db, 'accounts'));
		// else accountsQuery = query(collection(db, 'accounts'), orderBy(sortByField, 'asc'));
		const unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
			listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		accountsQuery = query(collection(db, 'accounts'), orderBy(sortByField, 'asc'));
	}

	async function searchAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		accountsQuery = query(
			collection(db, 'accounts'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	$: getAccounts(accountsQuery);
</script>

<svelte:head>
	<title>Accounts - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Accounts</h1>
	<div class="flex justify-between">
		<form on:submit|preventDefault={searchAccounts}>
			<select bind:value={searchByField} required>
				<option value="" disabled selected>Search Filter</option>
				<option value="firstname">Name</option>
				<option value="addressBlock">Block</option>
				<option value="addressLot">Lot</option>
				<option value="addressStreet">Street</option>
				<option value="email">Email</option>
			</select>
			<input type="search" placeholder="Search here" required bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy}>
			<option value="" disabled selected>Sort By</option>
			<option value="firstname">Name</option>
			<option value="addressBlock">Block</option>
			<option value="addressLot">Lot</option>
			<option value="addressStreet">Street</option>
			<option value="email">Email</option>
		</select>
		<a
			class="px-1 text-sm bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/accounts/create">Add User</a
		>
	</div>

	<!-- Medium to large screen -->
	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block">
		<table class="border-2 border-black bg-white w-full text-center">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="p-3 text-sm tracking-wide">Name</th>
					<th class="p-3 text-sm tracking-wide">Address</th>
					<th class="p-3 text-sm tracking-wide">Email</th>
					<th class="p-3 text-sm tracking-wide">Role</th>
					<th class="p-3 text-sm tracking-wide" />
				</tr>
			</thead>
			<tbody>
				{#each listOfUsers as user}
					<tr class="border-t-2 border-black">
						<td class="p-3 text-sm whitespace-nowrap">{user.firstname + ' ' + user.lastname}</td>
						<td class="p-3 text-sm whitespace-nowrap"
							>{'Block ' +
								user.addressBlock +
								' Lot ' +
								user.addressLot +
								' ' +
								user.addressStreet +
								' Street'}</td
						>
						<td class="p-3 text-sm whitespace-nowrap">{user.email}</td>
						<td class="p-3 text-sm whitespace-nowrap">{user.role}</td>
						<td class="p-3 text-sm whitespace-nowrap">
							<a
								href={'/admin/accounts/edit/' + user.id}
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
		{#each listOfUsers as user}
			<div class="bg-white space-y-3 p-4 border-2 border-black">
				<div class="flex items-center space-x-2  text-sm">
					<div>
						<span class="font-bold text-sm">Name: </span>
						{user.firstname + ' ' + user.lastname}
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
