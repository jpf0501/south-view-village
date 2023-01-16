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
	<div class="flex flex-col md:flex-row justify-between">
		<form on:submit|preventDefault={searchAccounts} class="my-4">
			<select bind:value={searchByField} class="select select-bordered" required>
				<option value="" disabled selected>Search Filter</option>
				<option value="firstname">Name</option>
				<option value="addressBlock">Block</option>
				<option value="addressLot">Lot</option>
				<option value="addressStreet">Street</option>
				<option value="email">Email</option>
			</select>
			<input type="search" placeholder="Search here" class="input input-bordered mx-2" required bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="firstname">Name</option>
			<option value="addressBlock">Block</option>
			<option value="addressLot">Lot</option>
			<option value="addressStreet">Street</option>
			<option value="email">Email</option>
		</select>
		<a class="btn btn-primary my-4" href="/admin/accounts/create">Add User</a>
	</div>

	<style>
		table {
			counter-reset: section;
		}
		.count:before {
			counter-increment: section;
			content: counter(section);
		}
	</style>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th></th>
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
							<td class="count"></td>
							<td>{user.firstNameDisplay + ' ' + user.lastNameDisplay}</td>
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
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#each listOfUsers as user}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{user.firstNameDisplay + ' ' + user.lastNameDisplay}</h2>
					<div>
						<span class="my-1 font-bold">Role:</span>
						{user.role}
					</div>
					<div>
						<span class="my-1 font-bold">Address:</span>
						{'Block ' +
						user.addressBlock +
						' Lot ' +
						user.addressLot +
						' ' +
						user.addressStreet +
						' Street'}
					</div>
					<div>
						<span class="my-1 font-bold">E-mail Address:</span>
						{user.email}
					</div>
					<div class="card-actions justify-end">
						<a href={'/admin/accounts/edit/' + user.id} class="btn btn-primary hover:underline">Edit</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
</div>
