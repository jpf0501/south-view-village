<script>
	import { userStore } from '$lib/store';
	import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { getCountSnapshot } from '$lib/utils';
	import OngoingComplaints from './OngoingComplaints.svelte';

	let listOfComplaints = [];
	let unsubscribe = () => {};

	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let resultCount = 0;


	let complaintQuery = query(
		collection(db, 'complaints'),
		where('status', '==', 'Pending'),
		orderBy('dateSubmitted', 'asc')
	);

	async function changeSortBy() {
		complaintQuery = query(
			collection(db, 'complaints'),
			where('status', '==', 'Pending'),
			orderBy(sortByField, 'asc'),
			orderBy('dateSubmitted', 'asc')
		);
	}

	async function searchComplaints() {
		let searchByValueCase = searchByValue.toLowerCase();
		complaintQuery = query(
			collection(db, 'complaints'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			where('status', '==', 'Pending'),
			orderBy(searchByField, 'asc'),
			orderBy('dateSubmitted', 'asc')
		);
	}

	async function resetButton() {
		complaintQuery = query(
			collection(db, 'complaints'),
			where('status', '==', 'Pending'),
			orderBy('dateSubmitted', 'asc')
		);
		searchByValue = '';
	}

	async function getComplaints(complaintQuery) {
		unsubscribe();
		unsubscribe = onSnapshot(complaintQuery, (querySnapshot) => {
			listOfComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		resultCount = await getCountSnapshot(complaintQuery);
	}

	$: getComplaints(complaintQuery);
</script>

<svelte:head>
	<title>Complaints - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Complaints</h1>
	<div class="flex flex-row justify-end ">
		<a href="/admin/complaint/history" class="btn btn-primary">History</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchComplaints}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstname">First Name</option>
					<option value="lastname">Last Name</option>
					<option value="email">Email</option>
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
			<option value="firstname">First Name</option>
			<option value="lastname">Last Name</option>
			<!-- <option value="email">Email</option> -->
		</select>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<caption class="text-lg font-bold mb-2">List of Pending Complaints</caption>
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Complaint</th>
						<!-- <th class="text-lg">Date Inquired</th> -->
						<th />
						<!-- <th />	 -->
					</tr>
				</thead>
				<tbody>
					{#if resultCounts === 0}
						<tr>
							<td colspan="5" class="text-center py-4"> No Current Complaints </td>
						</tr>
					{:else}
						{#each listOfComplaints as complaint, i}
							{#if complaint.complaintantID !== $userStore?.uid}
								<tr class="hover">
									<td>{i + 1}</td>
									<td>{complaint.firstnameDisplay + ' ' + complaint.lastnameDisplay}</td>
									<td>{complaint.email}</td>
									<td>{complaint.complaint.substring(0, 50) + '...'}</td>
									<td
										><a class="btn btn-primary" href={'/admin/complaint/view/' + complaint.id}
											>View Complaint</a
										></td
									>
								</tr>
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		<h1 class="text-xl font-bold">List of Pending Complaints</h1>
		{#if resultCount === 0}
		<div>
			<span class="text-center py-4"> No Current Ongoing Complaints </span>
		</div>
	{:else}
		{#each listOfComplaints as complaint}
			{#if complaint.complaintantID !== $userStore?.uid}
				<div class="card w-[105%] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-2">
							{complaint.firstnameDisplay + ' ' + complaint.lastnameDisplay}
						</h2>
						<div>
							<span class="my-1 font-bold">Email: </span>
							{complaint.email}
						</div>
						<div>
							<span class="my-1 font-bold">Complaint: </span>
							{complaint.complaint.substring(0, 30) + '...'}
						</div>
						<!-- <div>
						<span class="my-1 font-bold">Date Inquired:</span>
						{inquiry.dateCreated
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							inquiry.dateCreated
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
					</div> -->
						<div class="card-actions justify-end">
							<a class="btn btn-primary" href={'/admin/complaint/view/' + complaint.id}
								>View Complaint</a
							>
						</div>
					</div>
				</div>
			{/if}
		{/each}
		{/if}
	</div>
	<div>
		<OngoingComplaints/>
	</div>
	<div>
		<OngoingComplaints />
	</div>
</div>
