<script>
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

<div class="flex flex-row justify-end">
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
<div class="mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
	<table class="table w-full">
		<caption class="text-lg font-bold mb-2">List of Ongoing Complaints</caption>
		<thead>
			<tr>
				<th />
				<th class="text-lg">Name</th>
				<th class="text-lg">Complaint</th>
				<th />
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
						<td
							><a
								href="/admin/complaint/respond/{ongoingComplaints.convoID}"
								class="btn btn-primary">Goto Convo</a
							></td
						>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
