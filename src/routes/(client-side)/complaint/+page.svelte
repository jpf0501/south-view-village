<script>
	import { userStore } from '$lib/store';
	import { query, collection, where, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	// import { getCountSnapshot } from '$lib/utils';

	let listOfOngoingComplaints = [];
	let listOfPendingComplaints = [];
	// let resultCountOfOngoingComplaints = 0;
	// let resultCountOfPendingComplaints = 0;
	let unsubscribeOngoing = () => {};
	let unsubscribePending = () => {};
	async function getOngoingComplaints() {
		const ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', '==', 'Ongoing'),
			where('complaintantID', '==', $userStore.uid)
		);
		unsubscribeOngoing();
		unsubscribeOngoing = onSnapshot(ongoingComplaintsQuery, (querySnapshot) => {
			listOfOngoingComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		// resultCountOfOngoingComplaints = await getCountSnapshot(ongoingComplaintsQuery);
		// console.log(resultCountOfOngoingComplaints)
	}
	async function getPendingComplaints() {
		const pendingComplaintsQuery = query(
			collection(db, 'complaints'),
			where('status', '==', 'Pending'),
			where('complaintantID', '==', $userStore.uid)
		);
		unsubscribePending();
		unsubscribePending = onSnapshot(pendingComplaintsQuery, (querySnapshot) => {
			listOfPendingComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		// resultCountOfPendingComplaints = await getCountSnapshot(pendingComplaintsQuery);
		// console.log(resultCountOfPendingComplaints)
	}

	getPendingComplaints();
	getOngoingComplaints();
</script>
<div class="flex flex-row justify-end">
    <a href="/complaint/create" class="btn btn-primary m-2 mx-2">New Complaint</a>
</div>
<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
  
	<table class="table w-full">
		<caption class="text-lg font-bold mb-2">List of Ongoing Complaints</caption>
		<thead>
			<tr>
				<th />
				<th class="text-lg">Complaint</th>
				<th />
			</tr>
		</thead>
		<tbody>
			{#each listOfOngoingComplaints as ongoingComplaints, i}
				<tr class="hover">
					<td>{i + 1}.</td>
					<td>{ongoingComplaints.complaintContent.substring(0, 30) + '...'}</td>
					<td
						><a href="/complaint/complaintConversation/{ongoingComplaints.convoID}" class="btn btn-primary"
							>Goto Convo</a
						></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>


<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100 mt-5">
	<table class="table w-full">
		<caption class="text-lg font-bold mb-2">List of Pending Complaints</caption>
		<thead>
			<tr>
				<th />
				<th class="text-lg">Complaint</th>
			</tr>
		</thead>
		<tbody>
			{#each listOfPendingComplaints as pendingComplaints, i}
				<tr class="hover">
					<td>{i + 1}.</td>
					<td>{pendingComplaints.complaint.substring(0, 30) + '...'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

