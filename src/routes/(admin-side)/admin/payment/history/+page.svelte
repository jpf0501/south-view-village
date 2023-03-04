<script>
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		where,
		getCountFromServer
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfPayments = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let paymentsQuery = query(collection(db, 'payments'));

	let countofSearchResult = '';
	let noResult = false;

	let currentPage = 1;
	let pageSize = 10;
	let totalRecords = 1;
	let totalPages = 0;

	async function getPayments(paymentsQuery, page, pageSize) {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const unsubscribe = onSnapshot(paymentsQuery, (querySnapshot) => {
			listOfPayments = querySnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.slice(startIndex, endIndex);
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		paymentsQuery = query(collection(db, 'payments'), orderBy(sortByField, 'asc'));
		noResult = false;
	}

	async function searchAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		paymentsQuery = query(
			collection(db, 'payments'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);

		const snapshotOfCountOfPendingBookings = await getCountFromServer(paymentsQuery);
		countofSearchResult = snapshotOfCountOfPendingBookings.data().count;
		countofSearchResult === 0 ? (noResult = true) : (noResult = false);
	}

	async function resetButton() {
		paymentsQuery = query(collection(db, 'payments'));
		searchByValue = '';
		noResult = false;
	}

	$: {
		getPayments(paymentsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(paymentsQuery, (querySnapshot) => {
			totalRecords = querySnapshot.docs.length;
			totalPages = Math.ceil(totalRecords / pageSize);
		});
		onDestroy(() => unsubscribe());
	}
	function goToPage(page) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Payment History - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-5">
	<h1 class="text-3xl font-semibold py-2">Payment History</h1>
	<div class="flex justify-end">
		<a href="/admin/payment/" class="btn btn-primary ">Go to Payment</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchAccounts}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstName">Name</option>
					<option value="email">Email</option>
				</select>
				<input
					type="search"
					placeholder="Search here"
					class="input input-bordered"
					bind:value={searchByValue}
				/>
			</form>
			<button on:click={resetButton} class="btn btn-primary my-4 mx-2">Reset</button>
		</div>

		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="firstName">Name</option>
			<option value="paymentTime">Payment Date</option>
		</select>

		<button class="btn btn-primary my-4">Generate Report</button>
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
						<th class="text-lg">Contact No.</th>
						<th class="text-lg">Payment Date</th>
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="py-24 text-center" colspan="8">No result found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfPayments as payment}
						<tr class="hover">
							<td class="count" />
							<td>{payment.firstNameDisplay} {payment.lastNameDisplay}</td>
							<td
								>Block {payment.addressBlock} Lot {payment.addressLot}
								{payment.addressStreet} Street</td
							>
							<td>{payment.email}</td>
							<td>{payment.contact}</td>
							<td
								>{payment.paymentTime.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#if noResult}
			<div class="w-full mx-auto">No result found</div>
		{/if}
		{#each listOfPayments as user}
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

<!-- pagination button -->
<div class="flex justify-center items-center mt-5">
	<nav class="block">
		<ul class="flex pl-0 rounded list-none flex-wrap">
			{#if currentPage > 1}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage - 1)}
					>
						Previous
					</button>
				</li>
			{/if}

			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				{#if page === currentPage}
					<li>
						<button
							class="relative block py-2 px-3 leading-tight bg-blue-700 text-white hover:bg-blue-500 focus:bg-blue-500"
							>{page}</button
						>
					</li>
				{:else if (page >= currentPage - 2 && page <= currentPage + 2) || page === totalPages || page === 1}
					<li>
						<button
							class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
							on:click={() => goToPage(page)}
						>
							{page}
						</button>
					</li>
				{:else if page === currentPage - 3 || page === currentPage + 3}
					<li>
						<span
							class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700"
							>...</span
						>
					</li>
				{/if}
			{/each}

			{#if currentPage < totalPages}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage + 1)}
					>
						Next
					</button>
				</li>
			{/if}
		</ul>
	</nav>
</div>

<!-- mema comment -->
