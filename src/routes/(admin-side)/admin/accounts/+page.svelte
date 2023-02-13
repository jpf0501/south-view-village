<script>
	import { onSnapshot, query, collection, orderBy, where, limit, startAt, endAt } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfUsers = [];
	let pageCount = 1;
	let queryLimit = 10;
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let accountsQuery = query(collection(db, 'accounts'), limit(queryLimit));

	async function getAccounts(accountsQuery) {
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

	async function resetButton() {
		accountsQuery = query(collection(db, 'accounts'), limit(queryLimit));
		searchByValue = '';
	}

	async function nextPage() {
		pageCount++;
		accountsQuery = query(collection(db, 'accounts'), limit(queryLimit), orderBy('firstname'), startAt());
  	}

  	async function prevPage() {
    	if (pageCount <= 1) return;
   		pageCount--;
    	accountsQuery = query(collection(db, 'accounts'), limit(queryLimit), orderBy('firstname'), startAt(queryLimit -1));
  	}

	$: getAccounts(accountsQuery);
</script>

<svelte:head>
	<title>Accounts - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Accounts</h1>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form on:submit|preventDefault={searchAccounts} class="my-4">
				<select bind:value={searchByField} class="select select-bordered" required>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstname">Name</option>
					<!-- <option value="addressBlock">Block</option>
					<option value="addressLot">Lot</option>
					<option value="addressStreet">Street</option> -->
					<option value="email">Email</option>
				</select>
				<input
					type="search"
					placeholder="Search here"
					class="input input-bordered mx-2"
					bind:value={searchByValue}
				/>
			</form>
			<button on:click={resetButton} class="btn btn-primary my-4">Reset</button>
		</div>

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
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Address</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Role</th>
						<th />
						<th />
					</tr>
				</thead>
				<tbody>
					{#each listOfUsers as user}
						<tr class="hover">
							<td class="count" />
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
							<td />
							<td
								><a href={'/admin/accounts/edit/' + user.id} class="btn glass text-white"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										><path
											d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
										/></svg
									></a
								></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="flex mx-auto items-center justify-center my-8">
		<div class="grid grid-cols-2">
			<button class="btn btn-primary mx-1">Previous</button>
			<button class="btn btn-primary mx-1">Next</button>
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
						<a href={'/admin/accounts/edit/' + user.id} class="btn glass text-white"
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

<!-- mema comment -->
