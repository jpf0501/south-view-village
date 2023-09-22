<script>
	import { query, collection, where, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { getCountSnapshot } from '$lib/utils';

	const statusValues = ['Resolved', 'Unresolved'];

	let listOfOngoingComplaints = [];
	let sortByPriorityLevel = '';
	let sortByStatusField = '';
	let resultCount = 0;
	let unsubscribe = () => {};

	let ongoingComplaintsQuery = query(
		collection(db, 'conversations'),
		where('status', 'in', statusValues)
	);

	async function changePriorityLevel() {
		ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', 'in', statusValues),
			where('priority', '==', sortByPriorityLevel)
		);
	}

	async function sortByStatus() {
		ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', '==', sortByStatusField)
		);
	}

	async function resetButton() {
		ongoingComplaintsQuery = query(
			collection(db, 'conversations'),
			where('status', 'in', statusValues)
		);
		sortByStatusField = '';
		sortByPriorityLevel = '';
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

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Complaints History</h1>

	<div class="flex flex-row justify-between">
		<div>
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
		<div>
			<select
				bind:value={sortByStatusField}
				on:change={sortByStatus}
				class="select select-bordered mb-2 md:mb-0 md:mr-2"
				required
			>
				<option value="" disabled selected>Status</option>
				<option value="Resolved">Resolved</option>
				<option value="Unresolved">Unresolved</option>
			</select>
			<button on:click={resetButton} class="btn btn-primary">Reset</button>
		</div>
		<a href="/admin/complaint" class="btn btn-primary">Back</a>
	</div>
	<div class="mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
		<table class="table w-full">
			<!-- <caption class="text-lg font-bold mb-2">List of Ongoing Complaints</caption> -->
			<thead>
				<tr>
					<th />
					<th class="text-lg">Name</th>
					<th class="text-lg">Complaint</th>
					<th class="text-lg">Priority</th>
					<th class="text-lg">Status</th>
					<th />
				</tr>
			</thead>
			<tbody>
				{#if resultCount === 0}
					<tr>
						<td colspan="5" class="text-center py-4"> No History Complaints </td>
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
							<td>{ongoingComplaints.status}</td>
							<td
								><a
									href={'/admin/complaint/history/view/' + ongoingComplaints.convoID}
									class="btn btn-primary">View Conversation</a
								></td
							>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
