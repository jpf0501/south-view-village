<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import Conversation from './Conversation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { convoID } = data;

	let complaint = null;
	let getComplaintID;
	let newStatus;

	async function getComplaints() {
		const str = convoID;
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

	async function changeStatus() {
		console.log(newStatus);
		try {
			const complaintRef = doc(db, 'complaints', getComplaintID);
			const data = {
				status: newStatus
			};
			await updateDoc(complaintRef, data);
			// toast.success('Complaint marked as resolved!');
		} catch (error) {
			console.log(error);
			// toast.error('Error in marking complaint as resolved!');
		}
		try {
			const complaintRef = doc(db, 'conversations', convoID);
			const data = {
				status: newStatus
			};
			await updateDoc(complaintRef, data);
			// toast.success('Complaint marked as resolved!');
		} catch (error) {
			console.log(error);
			// toast.error('Error in marking complaint as resolved!');
		}
		goto('/admin/complaint');
	}
	getComplaints();
</script>

<svelte:head>
	<title>Complaint Response Form - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if complaint}
	<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-lg rounded-xl bg-white">
			<h1 class="text-2xl font-bold mb-4">
				Complaint by {complaint.firstnameDisplay + ' ' + complaint.lastnameDisplay}
			</h1>
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
				<Conversation {convoID} isDisable={false} />
				<div class="flex justify-end gap-3 mt-8">
					<button
						on:click={() => {
							newStatus = 'Resolved';
							changeStatus();
						}}
						type="button"
						class="btn btn-primary"
					>
						Mark as Resolve
					</button>
					<button
						on:click={() => {
							newStatus = 'Unresolved';
							changeStatus();
						}}
						type="button"
						class="btn btn-error text-white"
					>
						Mark as Unresolve
					</button>
					<a href="/admin/complaint" class="btn btn-error mx-1 text-white">Back</a>
				</div>
			</form>
		</div>
	</div>
{/if}
