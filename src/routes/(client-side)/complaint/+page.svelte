<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	let user = null;
	let complaint = '';
	let error = false;

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
		await sendComplaint();
		await goto("/complaint/success")
	}

	async function sendComplaint() {
		try {
			await addDoc(collection(db, 'complaints'), {
				firstname: user.firstNameDisplay.toLowerCase(),
				firstnameDisplay: user.firstNameDisplay,
				lastname: user.lastNameDisplay.toLowerCase(),
				lastnameDisplay: user.lastNameDisplay,
				email: user.email,
				contactNumber: user.contactNumber,
				complaint: complaint.trim(),
				dateSubmitted: serverTimestamp(),
				dateAnswered: serverTimestamp(),
				hadAnswered: false,
				response: ""
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

{#if user}
	<div class="min-h-screen hero bg-base-200 py-8">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Complaint Form</h1>
			</div>
			<form on:submit={checkInput}>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<label for="firstname" class="label">
							<span class="label-text">First Name</span>
						</label>
						<input
							type="text"
							placeholder="Juan"
							name="fname"
							class="input input-bordered"
							bind:value={user.firstNameDisplay}
							disabled
						/>
					</div>
					<div class="form-control">
						<label for="lastname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						<input
							type="text"
							placeholder="Dela Cruz"
							name="lname"
							class="input input-bordered"
							bind:value={user.lastNameDisplay}
							disabled
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<label for="firstname" class="label">
							<span class="label-text">Email</span>
						</label>
						<input
							type="text"
							placeholder="juandelacruz@gmail.com"
							name="fname"
							class="input input-bordered"
							bind:value={user.email}
							disabled
						/>
					</div>
					<div class="form-control">
						<label for="lastname" class="label">
							<span class="label-text">Contact no:</span>
						</label>
						<input
							type="tel"
							onkeypress="return event.charCode >= 48 && event.charCode <= 57"
							minlength="11"
							maxlength="11"
							placeholder="09123456789"
							pattern={String.raw`^(09)\d{9}$`}
							name="contact"
							class="input input-bordered"
							bind:value={user.contactNumber}
							disabled
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 mt-6">
					<div class="form-control">
						<label for="complaint" class="label">
							<span class="label-text">Complaint:</span>
						</label>
						{#if error}
							<p class="text-red-500 text-sm italic mb-1">Complaint must at least be 10 characters</p>
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
