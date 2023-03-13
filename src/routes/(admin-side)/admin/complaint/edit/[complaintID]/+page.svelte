<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';

	/** @type {import('./$types').PageData} */
	export let data;
	const { complaintID } = data;

	let complaint = null;

	async function getComplaints() {
		try {
			const snapshot = await getDoc(doc(db, 'complaints', complaintID));
			complaint = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting complaint');
		}
	}

	async function answerComplaint(firstname, lastname, email, complaint, responseOfAdmin){
		await response(responseOfAdmin)
		sendResponseToEmail(firstname, lastname, email, complaint)
	}

	async function response(responOfAdmin) {
		if (response.length < 10) {
			toast.error('Response must at least be 10 characters');
			return;
		}
		try {
			const complaintRef = doc(db, 'complaints', complaintID);
			const changeData = {
				hadAnswered: true,
				response: responOfAdmin
			};
			await updateDoc(complaintRef, changeData);
			goto('/admin/complaint');
		} catch (error) {
			console.log(error);
			toast.error('Error sending response!');
		}
	}

	async function sendResponseToEmail(firstname, lastname, email, complaint){
		try {
				await sendEmail({
					to: email,
					subject: 'Southview Homes 3 Inquiries',
					html: `<h1>Hello ${
						firstname + ' ' + lastname
					}, </h1> <div> We have receive your complaint about</div><div style="white-space:pre-wrap">${complaint}</div><h1>Our Response is </h1><div style="white-space:pre-wrap">${response}</div>`
				});
				toast.success('Response sent!');
			} catch (error) {
				console.log(error);
				toast.error('Error in sending reponse of the complaint');
			}
	}

	async function deleteComplaint() {
		try {
			await deleteDoc(doc(db, 'complaints', complaintID), complaint);
			toast.success('Complaint deleted!');
			await goto('/admin/complaint');
		} catch (error) {
			console.log(error);
			toast.error('Error in deleting in complaint!');
		}
	}
	getComplaints();
</script>

<svelte:head>
	<title>Answer Complaints - Southview Homes 3 Admin Panel</title>
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
					<div class="h-60 border rounded-md p-4 overflow-y-scroll">
						{complaint.complaint}
					</div>
				</div>
				<div class="flex flex-col mb-6">
					<div class="text-gray-700 font-bold mb-2">Response</div>
					<textarea
						class="h-60 border rounded-md p-4 resize-none"
						required
						bind:value={complaint.response}
					/>
				</div>
				<div class="flex justify-end mt-8">
					<button
						on:click={answerComplaint(
							complaint.firstnameDisplay,
							complaint.lastnameDisplay,
							complaint.email,
							complaint.complaint,
							complaint.response
						)}
						type="submit"
						class="btn btn-primary"
					>
						Submit
					</button>
					<a href="/admin/inquiries" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={deleteComplaint} type="submit" class="btn btn-warning mx-1 text-white">
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
