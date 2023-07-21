<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import FirstnameForm from '$lib/FormComponents/FirstnameForm.svelte';
	import LastnameForm from '$lib/FormComponents/LastnameForm.svelte';
	import EmailForm from '$lib/FormComponents/EmailForm.svelte';
	import ContactForm from '$lib/FormComponents/ContactForm.svelte';
	import Confirmation from '../../../../lib/Components/Confirmation.svelte';
	import toast from 'svelte-french-toast';

	let user = null;
	let complaint = '';
	let error = false;
	let confirmation = false;


	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}

	async function checkInput() {
		if (complaint.length < 10) {
			error = true;
			setTimeout(() => {
				error = false;
			}, 2000);
			return;
		}
		confirmation = true;
	}

	async function confirmSubmit() {
    // User clicked "Confirm" in the modal
    confirmation = false; // Hide the modal
    await sendComplaint();
    await goto('/complaint/success');
  }	

  async function cancelSubmit() {
    // User clicked "Cancel" in the modal
    confirmation = false; // Hide the modal
  }

	async function sendComplaint() {
		try {
			await addDoc(collection(db, 'complaints'), {
				firstname: user.firstNameDisplay.toLowerCase(),
				firstnameDisplay: user.firstNameDisplay,
				lastname: user.lastNameDisplay.toLowerCase(),
				lastnameDisplay: user.lastNameDisplay,
				address: "Block " + user.addressBlock + " Lot " + user.addressLot + " " + user.addressStreet + " Street",
				email: user.email,
				contactNumber: user.contactNumber,
				complaint: complaint.trim(),
				complaintantID: $userStore.uid,
				dateSubmitted: serverTimestamp(),
				status: 'Pending'
			});
		} catch (error) {
			console.log(error);
			toast.error('Error in sending complaint!');
		}
	}

	$: if ($userStore) {
		getUser();
	} else if ($userStore === null) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Complaint Form - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} />

<div class="flex flex-row justify-end bg-base-200 pt-2">
	<a href="/complaint/" class="btn btn-primary">Go Back</a>
</div>
{#if user}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-5 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Complaint Form</h1>
			</div>
			<form on:submit={checkInput}>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-2">
					<FirstnameForm bind:value={user.firstNameDisplay} isDisabled={true} />
					<LastnameForm bind:value={user.lastNameDisplay} isDisabled={true} />
				</div>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-2">
					<EmailForm bind:value={user.email} isDisabled={true} />
					<ContactForm bind:value={user.contactNumber} isDisabled={true} />
				</div>
				<div class="grid grid-cols-1 mt-6">
					<div class="form-control">
						<label for="complaint" class="label">
							<span class="label-text">Complaint:</span>
						</label>
						{#if error}
							<p class="text-red-500 text-sm italic mb-1">
								Complaint must at least be 10 characters
							</p>
						{/if}
						<textarea
							class="textarea textarea-bordered h-32 w-full"
							placeholder="Message"
							style="resize: none;"
							bind:value={complaint}
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary">Submit Complaint</button>
				</div>
			</form>
		</div>
	</div>
{/if}
