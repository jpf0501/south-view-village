<script>
	import { onSnapshot, query, collection, snapshotEqual, orderBy } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfUsers = [];

	const accountsQuery = query(collection(db, 'accounts'));
	const unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
		listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());

	let userSort = '';

	async function sortBy() {
		if (userSort == 'Name') {
			const sortByNameQuery = query(collection(db, 'accounts'), orderBy('firstname', 'asc'));
			const unsubscribe = onSnapshot(sortByNameQuery, (querySnapshot) => {
				listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		} else if (userSort == 'Block') {
			const sortByBlockQuery = query(collection(db, 'accounts'), orderBy('addressBlock', 'asc'));
			const unsubscribe = onSnapshot(sortByBlockQuery, (querySnapshot) => {
				listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		} else if (userSort == 'Lot') {
			const sortByLotQuery = query(collection(db, 'accounts'), orderBy('addressLot', 'asc'));
			const unsubscribe = onSnapshot(sortByLotQuery, (querySnapshot) => {
				listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		} else if (userSort == 'Street') {
			const sortByStreetQuery = query(collection(db, 'accounts'), orderBy('addressStreet', 'asc'));
			const unsubscribe = onSnapshot(sortByStreetQuery, (querySnapshot) => {
				listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		} else if (userSort == 'Email') {
			const sortByEmailQuery = query(collection(db, 'accounts'), orderBy('email', 'asc'));
			const unsubscribe = onSnapshot(sortByEmailQuery, (querySnapshot) => {
				listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
			onDestroy(() => unsubscribe());
		}
	}
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Accounts</h1>
	<div class="flex justify-between">
		<h1 class="text-xl font-semibold">Users</h1>
		<input type="search" placeholder="Search here" />
		<form>
			<select bind:value={userSort} on:click={sortBy} name="" id="">
				<option value="" disabled selected>Sort By</option>
				<option value="Name">Name</option>
				<option value="Block">Block</option>
				<option value="Lot">Lot</option>
				<option value="Street">Street</option>
				<option value="Email">Email</option>
			</select>
		</form>
		<a
			class="px-1 text-sm bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/accounts/create">Add User</a
		>
	</div>

	<!-- Medium to large screen -->
	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block">
		<table class="border-2 border-black bg-white w-full">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="p-3 text-sm tracking-wide text-left">Name</th>
					<th class="p-3 text-sm tracking-wide text-left">Address</th>
					<th class="p-3 text-sm tracking-wide text-left">Email</th>
					<th class="p-3 text-sm tracking-wide text-left">Role</th>
					<th class="p-3 text-sm tracking-wide text-left" />
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
					<div>
						<a
							href={'/admin/accounts/edit/' + user.id}
							class="text-blue-500 font-bold hover:underline">Edit</a
						>
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
			</div>
			<br />
		{/each}
	</div>
</div>
