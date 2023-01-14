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
	<div class="w-full p-6 mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th class="text-lg">Name</th>
						<th class="text-lg">Address</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Role</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{#each listOfUsers as user}
						<tr class="hover">
							<th>{user.firstNameDisplay + ' ' + user.lastNameDisplay}</th>
							<td
								>{'Block ' +
									user.addressBlock +
									' Lot ' +
									user.addressLot +
									' ' +
									user.addressStreet +
									' Street'}</td
							>
							<td>{user.email}</td>
							<td>{user.role}</td>
							<td
								><a
									href={'/admin/accounts/edit/' + user.id}
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
	<div class="bg-gray-300 my-5 p-5  selection:grid grid-cols-1 gap-4 md:hidden rounded-lg shadow">
		{#each listOfUsers as user}
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
