<script>
	import { userStore } from '$lib/store';
	import { query, collection, where, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { getCountSnapshot } from '$lib/utils';

	let resultCountOfPendingComplaints = 0;
	let userID = $userStore.uid;
	let listOfPendingComplaints = [];
	let unsubscribePending = () => {};

	async function getPendingComplaints() {
		const pendingComplaintsQuery = query(
			collection(db, 'complaints'),
			where('status', '==', 'Pending'),
			where('complaintantID', '==', userID)
		);
		unsubscribePending();
		unsubscribePending = onSnapshot(pendingComplaintsQuery, (querySnapshot) => {
			listOfPendingComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		resultCountOfPendingComplaints = await getCountSnapshot(pendingComplaintsQuery);
		// console.log(resultCountOfPendingComplaints)
	}

	getPendingComplaints();
</script>

<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100 mt-8">
	<div class="overflow-auto hidden md:block">
		<table class="table w-full">
			<caption class="text-lg font-bold mb-2">List of Pending Complaints</caption>
			<thead>
				<tr>
					<th />
					<th class="text-lg">Complaint</th>
				</tr>
			</thead>
			<tbody>
				{#if resultCountOfPendingComplaints === 0}
					<tr>
						<td colspan="5" class="text-center py-4"> No Current Pending Complaints </td>
					</tr>
				{:else}
					{#each listOfPendingComplaints as pendingComplaints, i}
						<tr class="hover">
							<td>{i + 1}.</td>
							<td>{pendingComplaints.complaint.substring(0, 30) + '...'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		<h1 class="text-xl font-bold">List of Pending Complaints</h1>
		{#if resultCountOfPendingComplaints === 0}
			<div>
				<span class="text-center py-4"> No Current Pending Complaints </span>
			</div>
		{:else}
			{#each listOfPendingComplaints as pendingComplaints}
				<div class="card w-[105%] bg-base-100 shadow-xl">
					<div class="card-body">
						<!-- <h2 class="card-title mb-2">
						{pendingComplaints.firstnameDisplay + ' ' + pendingComplaints.lastnameDisplay}
					</h2>
					<div>
						<span class="my-1 font-bold">Email: </span>
						{pendingComplaints.email}
					</div> -->
						<div>
							<span class="my-1 font-bold">Complaint: </span>
							{pendingComplaints.complaint.substring(0, 30) + '...'}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
