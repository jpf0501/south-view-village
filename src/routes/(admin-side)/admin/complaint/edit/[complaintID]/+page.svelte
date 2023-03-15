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

	async function submitHandler(firstname, lastname, email, complaint, response) {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		await answerComplaint(response);
		sendResponseToEmail(firstname, lastname, email, complaint, response);
	}

	async function checkInput() {
		errors = {
			response: !complaint.response,
			responseKulang: complaint.response.length < 10
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function answerComplaint(response) {
		if (response.length < 10) {
			toast.error('Response must at least be 10 characters');
			return;
		}
		try {
			const complaintRef = doc(db, 'complaints', complaintID);
			const changeData = {
				hadAnswered: true,
				response: response
			};
			await updateDoc(complaintRef, changeData);
			goto('/admin/complaint');
		} catch (error) {
			console.log(error);
			toast.error('Error sending response!');
		}
	}

	async function sendResponseToEmail(firstname, lastname, email, complaint, response) {
		try {
			await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Complaint',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				</center>
				<p>Dear ${firstname} ${lastname},</p>
				<p>We apologize for any inconvenience or frustration that you have experienced. We appreciate you bringing this issue to our attention, and we would like to assure you that we take all complaints seriously and are committed to resolving this matter promptly.</p>
				<p>After reviewing your complaint, we have identified the problem and understand that this issue may have caused you inconvenience and we will take steps to ensure that it does not happen again in the future.</p>
				<p>In response to your complaint,</p> 
				<p>${response}</p>
				<p>Thank you for your patience and understanding as we work to resolve this issue.</p>
				<p>Best regards,</p>
				<p>Soutview Homes 3</p>`
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
					{#if errors.response}
						<p class="text-red-500 text-sm italic mb-1">Response is required</p>
					{:else if errors.responseKulang}
						<p class="text-red-500 text-sm italic mb-1">Response must at least be 10 characters</p>
					{/if}
					<textarea
						class="h-60 border rounded-md p-4 resize-none"
						bind:value={complaint.response}
					/>
				</div>
				<div class="flex justify-end mt-8">
					<button
						on:click={submitHandler(
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
					<a href="/admin/complaint" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={deleteComplaint} type="submit" class="btn btn-warning mx-1 text-white">
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
