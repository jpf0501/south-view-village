<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import ChangePassword from './ChangePassword.svelte';
	import toast from 'svelte-french-toast';

	let user = null;

	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}
	$: if ($userStore) {
		getUser();
	} else if ($userStore === null) {
		goto('/');
	}
	async function updateInfo() {
		try {
			await updateDoc(doc(db, 'accounts', $userStore.uid), user);
			toast.success('Update Success!')
			await goto('/profile');
		} catch (error) {
			console.log(error);
			toast.error("Error in Updating")
		}
	}
</script>

<svelte:head>
	<title>Edit Profile - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

{#if user}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl mt-2">Edit Profile</h1>
			<form on:submit|preventDefault={updateInfo}>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<h1 class="input input-bordered p-3 mt-2 bg-gray-200">
							{user.firstNameDisplay}
							{user.lastNameDisplay}
						</h1>
					</div>
					<div class="form-control">
						<span class="label-text">Address</span>
						<h1 class="input input-bordered p-3 mt-2 bg-gray-200">
							Block {user.addressBlock} Lot {user.addressLot}
							{user.addressStreet} Street
						</h1>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">E-mail Address</span>
						<h1 class="input input-bordered p-3 mt-2 bg-gray-200">{user.email}</h1>
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<input
							type="tel"
							onkeypress="return event.charCode >= 48 && event.charCode <= 57"
							minlength="11"
							maxlength="11"
							placeholder="09123456789"
							pattern={String.raw`^(09)\d{9}$`}
							bind:value={user.contactNumber}
							name="contact"
							class="input input-bordered mt-2"
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary mx-1">Update Info</button>
					<a href="/profile" class="btn btn-error mx-1 text-white px-4">Cancel</a>
				</div>
			</form>
			<div class="mt-5">
				<ChangePassword />
			</div>
		</div>
	</div>
{/if}
