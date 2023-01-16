<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc } from 'firebase/firestore';
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;
	const { userID } = data;

	let user = null;

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', userID));
		user = snapshot.data();
		user.firstname = user.firstNameDisplay;
		user.lastname = user.lastNameDisplay;
	}
	getUser();

	async function updateUser() {
		user.firstname = user.firstNameDisplay.toLowerCase();
		user.lastname = user.lastNameDisplay.toLowerCase();
		try {
			await updateDoc(doc(db, 'accounts', userID), user);
			alert('User info updated');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}

	async function deleteUser() {
		try {
			await fetch('/api/accounts/', { method: 'DELETE', body: JSON.stringify({ uid: userID }) });
			alert('Deleted successfully');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			alert('Delete error');
		}
	}
</script>

<svelte:head>
	<title>Edit Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

<style>
	input[type='number'] {
  		appearance: textfield;
	}
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button,
	input[type='number']:hover::-webkit-inner-spin-button, 
	input[type='number']:hover::-webkit-outer-spin-button {
		-webkit-appearance: none; 
		margin: 0;
	}
</style>

{#if user}
	<main>
		<div class="min-h-screen hero bg-base-200">
			<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
				<h1 class="text-2xl mt-2">Edit Account</h1>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">First Name</span>
						</label>
						<input
							type="text"
							name="fname"
							class="input input-bordered"
							required
							bind:value={user.firstNameDisplay}
						/>
					</div>
					<div class="form-control">
						<label for="lname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						<input
							type="text"
							name="lname"
							class="input input-bordered"
							required
							bind:value={user.lastNameDisplay}
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						<input
							type="number"
							name="Block"
							class="input input-bordered"
							required
							bind:value={user.addressBlock}
						/>
					</div>
					<div class="form-control">
						<label for="Lot" class="label">
							<span class="label-text">Lot</span>
						</label>
						<input
							type="number"
							name="Lot"
							class="input input-bordered"
							required
							bind:value={user.addressLot}
						/>
					</div>
					<div class="form-control">
						<label for="Street" class="label">
							<span class="label-text">Street</span>
						</label>
						<input
							type="text"
							name="Street"
							class="input input-bordered"
							required
							bind:value={user.addressStreet}
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text mb-3">Role</span>
						<div class="mb-3">
							<select
								class="select select-bordered w-full"
								aria-label="Default select example"
								required
								bind:value={user.role}
							>
								<option value="Resident">Resident</option>
								<option value="Admin">Admin</option>
							</select>
						</div>
					</div>
				</div>
				<div class="form-control">
					<label for="lname" class="label">
						<span class="label-text">Contact No.</span>
					</label>
					<input
						type="tel"
						onkeypress="return event.charCode >= 48 && event.charCode <= 57"
						minlength="11" maxlength="11"
						placeholder="09123456789"
						pattern={String.raw`^(09)\d{9}$`}
						name="contact"
						class="input input-bordered"
						required
						bind:value={user.contactNumber}
					/>
				</div>
				<div class="flex justify-end mt-8">
					<button
						on:click={updateUser}
						type="submit"
						class="btn btn-primary mx-1 px-5">Save</button
					>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white"
						>Cancel</a
					>
					<button
						on:click={deleteUser}
						type="submit"
						class="btn btn-warning mx-1 text-white">Delete</button
					>
				</div>
			</div>
		</div>
	</main>
{/if}
