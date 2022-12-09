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

<main>
	<div class="my-5 mx-12">
		<div>
			<h1 class="text-3xl font-bold my-4">Accounts</h1>
		</div>
		<div class="flex justify-between m-3">
			<h1 class="px-1 text-xl font-semibold">Users</h1>
			<input type="search" placeholder="Search here" />
			<a
				class="px-1 text-base bg-blue-400 rounded-full hover:bg-blue-800 flex items-center border-blue-700"
				href="/admin/accounts/create">Add User</a
			>
		</div>
		<div>
			<table class="border-2 border-black w-full">
				<thead>
					<tr class=" px-5 font-bold bg-gray-500">
						<th class="text-left text-base">Name</th>
						<th class="text-left text-base">Email</th>
						<th class="text-left text-base">Address</th>
						<th class="text-left text-base">Role</th>
					</tr>
				</thead>
				<tbody>
					{#each listOfUsers as user}
						<tr class="text-base text-center">
							<td class="text-left text-base bg-gray-300">{user.firstname + ' ' + user.lastname}</td
							>
							<td class="text-left text-base bg-gray-300"
								>{user.addressBlock + ' ' + user.addressLot + ' ' + user.addressStreet}</td
							>
							<td class="text-left text-base bg-gray-300">{user.email}</td>
							<td class="text-left text-base bg-gray-300">{user.role}</td>
							<a class="" href={'/admin/accounts/edit/' + user.id}>Edit</a>
							<!-- <h1>{ JSON.stringify(user) }</h1> -->
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>
