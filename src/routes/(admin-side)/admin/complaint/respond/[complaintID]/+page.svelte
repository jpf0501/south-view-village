<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import Conversation from '../../Conversation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { complaintID } = data;

	let complaint = null;
	let errors = {};

	async function getComplaints() {
		try {
			const snapshot = await getDoc(doc(db, 'complaints', complaintID));
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
	<title>Complaint Response Form - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if complaint}
	<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-lg rounded-xl bg-white">
			<h1 class="text-2xl font-bold mb-4">
				Complaint by {complaint.firstnameDisplay + ' ' + complaint.lastnameDisplay}
			</h1>
			<form class="w-full">
				<div class="flex flex-col mb-6">
					<div class="text-gray-700 font-bold mb-2">Complaint</div>
					<div id="noScroll" class="h-40 border rounded-md p-4 overflow-y-scroll">
						{complaint.complaint}
					</div>
				</div>
				<Conversation/>
				<div class="flex justify-end mt-8">
					<button on:click={markAsResolve} type="submit" class="btn btn-primary">
						Mark as Resolve
					</button>
					<a href="/admin/complaint" class="btn btn-error mx-1 text-white">Back</a>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Hide the scrollbar */
	#noScroll::-webkit-scrollbar {
		width: 0;
		background-color: #f5f5f5;
	}

	/* textarea::-webkit-scrollbar-thumb {
	  background-color: #000000;
	} */
</style>