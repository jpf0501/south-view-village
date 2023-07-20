<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, doc } from 'firebase/firestore';
	import toast from 'svelte-french-toast';
	import ConversationClient from './ConversationClient.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { complaintID } = data;
	let complaint = null;

	async function getComplaints() {
		let getComplaintID;
		const str = complaintID;
		const pattern = /COMPLAINT(.*)/;
		const match = str.match(pattern);

		if (match && match.length > 1) {
			getComplaintID = match[1];
		}
		try {
			const snapshot = await getDoc(doc(db, 'complaints', getComplaintID));
			complaint = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting complaint');
		}
	}

	async function markAsResolve() {}
	getComplaints();
</script>

<svelte:head>
	<title>Complaint Response Form - Southview Homes 3 Resident Panel</title>
</svelte:head>

{#if complaint}
	<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-lg rounded-xl bg-white">
			<h1 class="text-2xl font-bold mb-4">Your Complaint:</h1>
			<p>Address: {complaint.address}</p>
			<p>
				Date Submitted: {complaint.dateSubmitted.toDate().toLocaleDateString('en-us', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}) +
					' at ' +
					complaint.dateSubmitted
						.toDate()
						.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
			</p>
			
			<form class="w-full">
				<div class="flex flex-col mb-6">
					<div class="text-gray-700 font-bold mb-2">Complaint</div>
					<div id="noScroll" class="h-40 border rounded-md p-4 overflow-y-scroll">
						{complaint.complaint}
					</div>
				</div>
				<ConversationClient {complaintID} />
				<div class="flex justify-end mt-8">
					<!-- <button on:click={markAsResolve} type="submit" class="btn btn-primary">
						Mark as Resolve
					</button> -->
					<a href="/complaint" class="btn btn-error mx-1 text-white">Back</a>
				</div>
			</form>
		</div>
	</div>
{/if}
