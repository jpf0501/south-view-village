<script>
	import { userStore } from '$lib/store';
	import { query, collection, where, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { getCountSnapshot } from '$lib/utils';

	let listOfOngoingComplaints = [];
	let sortByPriorityLevel = '';
	let resultCount = 0;
	let unsubscribe = () => {};

	let ongoingComplaintsQuery = query(
		collection(db, 'conversations'),
		where('status', '==', 'Ongoing')
	);

	async function changePriorityLevel() {
		ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', '==', 'Ongoing'),
			where('priority', '==', sortByPriorityLevel)
		);
	}

	async function resetButton() {
		ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', '==', 'Ongoing')
		);
	}

	async function getOngoingComplaints(ongoingComplaintsQuery) {
		unsubscribe();
		unsubscribe = onSnapshot(ongoingComplaintsQuery, (querySnapshot) => {
			listOfOngoingComplaints = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		resultCount = await getCountSnapshot(ongoingComplaintsQuery);
	}

	$: getOngoingComplaints(ongoingComplaintsQuery);
</script>

<div class="flex flex-row gap-3 justify-end">
	<select
		bind:value={sortByPriorityLevel}
		on:change={changePriorityLevel}
		class="select select-bordered mb-2 md:mb-0 md:mr-2"
		required
	>
		<option value="" disabled selected>Priority Level</option>
		<option value="Low">Low</option>
		<option value="Medium">Medium</option>
		<option value="High">High</option>
	</select>
	<button on:click={resetButton} class="btn btn-primary">Reset</button>
</div>
<div class="mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
	<div class="overflow-auto">
		<table class="table w-full">
			<caption class="text-lg font-bold mt-7 mb-5">List of Ongoing Complaints</caption>
			<thead>
				<tr>
					<th />
					<th />
					<th class="text-lg">Name</th>
					<th class="text-lg">Complaint</th>
					<th />
					
				</tr>
			</thead>
			<tbody>
				{#if resultCount === 0}
					<tr>
						<td colspan="5" class="text-center py-4"> No Current Ongoing Complaints </td>
					</tr>
				{:else}
					{#each listOfOngoingComplaints as ongoingComplaints, i}
						<tr class="hover">
							<td
								><a
									href="/admin/complaint/respond/{ongoingComplaints.convoID}"
									class="btn btn-primary">View Conversation</a
								></td
							>
							<td>{i + 1}</td>
							<td>{ongoingComplaints.complaintantName}</td>
							<td>{ongoingComplaints.complaintContent.substring(0, 30) + '...'}</td>
							<td
								class=" font-bold {ongoingComplaints.priority === 'Low'
									? 'text-green-500'
									: ongoingComplaints.priority === 'Medium'
									? 'text-orange-300'
									: 'text-red-500'}">{ongoingComplaints.priority}</td
							>
							
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
	<h1 class="text-xl font-bold">List of Ongoing Complaints</h1>
	{#if resultCount === 0}
		<div>
			<span class="text-center py-4"> No Current Ongoing Complaints </span>
		</div>
	{:else}
		{#each listOfOngoingComplaints as ongoingComplaint}
			{#if ongoingComplaint.complaintantID !== $userStore?.uid}
				<div class="card w-[105%] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-2">
							{ongoingComplaint.complaintantName}
						</h2>
						<div>
							<span class="my-1 font-bold">Complaint: </span>
							{ongoingComplaint.complaintContent.substring(0, 30) + '...'}
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
						<div>
							<span class="my-1 font-bold">Complaint: </span>
							{ongoingComplaint.complaintContent.substring(0, 30) + '...'}
						</div>
						<div>
							<span
								class=" font-bold {ongoingComplaint.priority === 'Low'
									? 'text-green-500'
									: ongoingComplaint.priority === 'Medium'
									? 'text-orange-300'
									: 'text-red-500'}">{ongoingComplaint.priority}</span
							>
						</div>
						<div class="card-actions justify-end">
							<a
								class="btn btn-primary"
								href={'/admin/complaint/respond/' + ongoingComplaint.convoID}>View Complaint</a
							>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>
