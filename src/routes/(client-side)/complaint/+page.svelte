<script>
	import { userStore } from '$lib/store';
	import { query, collection, where, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import PendingComplaintsClient from './PendingComplaintsClient.svelte';
	// import { getCountSnapshot } from '$lib/utils';

	let userID = $userStore.uid;
	let listOfOngoingComplaints = [];

	// let resultCountOfOngoingComplaints = 0;
	// let resultCountOfPendingComplaints = 0;
	let unsubscribeOngoing = () => {};

	async function getOngoingComplaints() {
		const ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', '==', 'Ongoing'),
			where('complaintantID', '==', userID)
		);
		unsubscribeOngoing();
		unsubscribeOngoing = onSnapshot(ongoingComplaintsQuery, (querySnapshot) => {
			listOfOngoingComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		// resultCountOfOngoingComplaints = await getCountSnapshot(ongoingComplaintsQuery);
		// console.log(resultCountOfOngoingComplaints)
	}

	getOngoingComplaints();
</script>

<div class="flex flex-row justify-end">
	<a href="/complaint/create" class="btn btn-primary m-2 mx-2">New Complaint</a>
</div>
<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
	<div class="overflow-auto">
		<table class="table w-full hidden md:block">
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
							><a
								href="/complaint/complaintConversation/{ongoingComplaints.convoID}"
								class="btn btn-primary">Goto Convo</a
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		<h1 class="text-xl font-bold">List of Ongoing Complaints</h1>
		{#each listOfOngoingComplaints as ongoingComplaints}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<!-- <h2 class="card-title mb-2">
						{ongoingComplaints.complaintantName}
					</h2> -->
					<div>
						<span class="my-1 font-bold">Complaint: </span>
						{ongoingComplaints.complaintContent.substring(0, 30) + '...'}
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
						<a
							class="btn btn-primary"
							href="/complaint/complaintConversation/{ongoingComplaints.convoID}">View Complaint</a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
<div>
	<PendingComplaintsClient />
</div>
