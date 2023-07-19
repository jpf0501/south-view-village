<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	export let data;
	let { complaintID } = data;

	let complaint = null;
	let priorityLevel;

	async function getComplaints() {
		try {
			const snapshot = await getDoc(doc(db, 'complaints', complaintID));
			complaint = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting complaint');
		}
	}

	async function generateConvoID(
		complaintantFirstname,
		complaintantLastname,
		complaintID,
		complaintantID,
		complaintContent
	) {
		if (priorityLevel === '') {
			return;
		}
		try {
			let convoID = complaintantFirstname + 'COMPLAINT' + complaintID;
			const conversationRef = doc(db, 'conversations', convoID);
			const conversationInfo = {
				complaintantName: complaintantFirstname + ' ' + complaintantLastname,
				complaintID: complaintID,
				convoID: convoID,
				complaintantID,
				complaintContent,
				status: 'Ongoing',
				priority: priorityLevel
			};

			await setDoc(conversationRef, conversationInfo);
			try {
				const updateStatusRef = doc(db, 'complaints', complaintID);
				await updateDoc(updateStatusRef, {
					status: 'Ongoing'
				});
			} catch (error) {
				console.log(error);
			}
			goto('/admin/complaint/respond/' + convoID);
		} catch (error) {
			console.log('Error in generating convo for complaints', error);
		}
	}

	getComplaints();
</script>

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
			<div class="flex flex-col mb-6">
				<span class="text-gray-700 font-bold mb-2">Complaint</span>
				<div id="noScroll" class="h-40 border rounded-md p-4 overflow-y-scroll">
					{complaint.complaint}
				</div>
				<div class="flex flex-row justify-end gap-3 mt-5">
					<form
						action=""
						class="flex flex-row gap-3"
						on:submit={generateConvoID(
							complaint.firstnameDisplay,
							complaint.lastnameDisplay,
							complaintID,
							complaint.complaintantID,
							complaint.complaint
						)}
					>
						<div class="flex flex-row">
							<label for="priorityLevel" class="label font-bold">Priority Level:</label>
							<select
								name=""
								id=""
								class="select border-2 border-blue-500"
								required
								bind:value={priorityLevel}
							>
								<option value="" disabled>Select</option>
								<option value="Low">Low</option>
								<option value="Medium">Medium</option>
								<option value="High">High</option>
							</select>
						</div>

						<button class="btn btn-primary" type="submit">Assist</button>
					</form>
					<a href="/admin/complaint" class="btn btn-error text-white">Back</a>
				</div>
			</div>
		</div>
	</div>
{/if}
