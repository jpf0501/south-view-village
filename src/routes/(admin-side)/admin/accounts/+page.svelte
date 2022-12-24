<script>
	import { onSnapshot, query, collection, snapshotEqual } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfUsers = [];

	const accountsQuery = query(collection(db, 'accounts'));
	const unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
		listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Accounts</h1>
	<div class="flex justify-between">
		<h1 class="text-2xl font-semibold">Users</h1>
		<input type="search" placeholder="Search here" />
		<a
			class="px-1 text-base bg-gray-400 rounded-full hover:bg-gray-300 flex items-center border-gray-700"
			href="/admin/accounts/create">Add User</a
		>
	</div>
	<div class="py-5 m-auto">
		<table class="border-2 border-black bg-white w-full">
			<thead>
				<tr class="font-bold bg-gray-500">
					<th class="text-left">Name</th>
					<th class="text-left">Address</th>
					<th class="text-left">Email</th>
					<th class="text-left">Role</th>
				</tr>
			</thead>
			<tbody>
				{#each listOfUsers as user}
					<tr class="border-t-2 border-black">
						<td class="text-left ">{user.firstname + ' ' + user.lastname}</td>
						<td class="text-left "
							>{'Block ' +
								user.addressBlock +
								' Lot ' +
								user.addressLot +
								' ' +
								user.addressStreet +
								' Street'}</td
						>
						<td class="text-left">{user.email}</td>
						<td class="text-left">{user.role}</td>

						<a href={'/admin/accounts/edit/' + user.id} class="text-blue-500">Edit</a>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
