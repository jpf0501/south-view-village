<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import ChangePassword from './ChangePassword.svelte';

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
			alert('Update info success');
			await goto('/profile');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}
</script>

{#if user}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl mt-2">Edit Profile</h1>
			<form on:submit|preventDefault={updateInfo}>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<input
							type="text"
							bind:value={user.firstname}
							name="fname"
							class="input input-bordered mt-2"
							disabled
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Address</span>
						<input
							type="text"
							bind:value={user.lastname}
							name="lname"
							class="input input-bordered mt-2"
							disabled
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">E-mail Address</span>
						<input
							type="email"
							name="email"
							bind:value={user.email}
							class="input input-bordered mt-2"
							disabled
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<input
							type="tel"
							bind:value={user.contactNumber}
							name="contact"
							class="input input-bordered mt-2"
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary mx-1">Update Info</button>
					<a href="/profile" class="btn btn-error mx-1 text-white">Cancel</a>
				</div>
			</form>
			<ChangePassword />
		</div>
	</div>
{/if}
