<script>
	import { db } from '$lib/firebase/client';
	import { getDocs, query, collection, orderBy, getDoc, updateDoc, doc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	/** @type {import('./$types').PageData} */
	export let data;
	const { userID } = data;

	let user = null;
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];

	const blockValue = Array.from({ length: 23 }, (_, i) => ({
		value: i + 1
	}));

	const lotValue = Array.from({ length: 26 }, (_, i) => ({
		value: i + 1
	}));

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', userID));
		user = snapshot.data();
		user.firstname = user.firstNameDisplay;
		user.lastname = user.lastNameDisplay;
	}
	getUser();

	async function getStreet() {
		const streetSnapshot = await getDocs(streetQuery);
		listOfStreets = streetSnapshot.docs.map((doc) => doc.data());
	}

	async function updateUser() {
		user.firstname = user.firstNameDisplay.trim().toLowerCase();
		user.lastname = user.lastNameDisplay.trim().toLowerCase();
		try {
			await updateDoc(doc(db, 'accounts', userID), user);
			toast.success('User has been updated!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating user!');
		}
	}

	async function deleteUser() {
		try {
			await fetch('/api/accounts/', { method: 'DELETE', body: JSON.stringify({ uid: userID }) });
			toast.success('User deleted!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.success('Error in deleting user!');
		}
	}

	getStreet(streetQuery);
</script>

<svelte:head>
	<title>Edit Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if user}
	<main>
		<div class="min-h-screen hero bg-base-200">
			<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
				<h1 class="text-2xl mt-2">Edit Account</h1>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
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
				<div class="grid grid-cols-2 gap-6 mt-4 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						<select class="select select-bordered w-full" required bind:value={user.addressBlock}>
							<option value="" disabled>Select block</option>
							{#each blockValue as block}
								<option value={block.value}>{block.value}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label for="Lot" class="label">
							<span class="label-text">Lot</span>
						</label>
						<select class="select select-bordered w-full" required bind:value={user.addressLot}>
							<option value="" disabled>Select lot</option>
							{#each lotValue as lot}
								<option value={lot.value}>{lot.value}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label for="Street" class="label">
							<span class="label-text">Street</span>
						</label>
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							required
							bind:value={user.addressStreet}
						>
							<option value="" selected disabled>Select street</option>
							{#each listOfStreets as street}
								<option value={street.streetName}>{street.streetName}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-4">
					<div class="form-control">
						<label for="role" class="label">
							<span class="label-text">Role</span>
						</label>
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							required
							bind:value={user.role}
						>
							<option value="" selected disabled>Select</option>
							<option value="Admin">Admin</option>
							<option value="Resident">Resident</option>
						</select>
					</div>
					<div class="form-control">
						<label for="paymentHead" class="label">
							<span class="label-text">Payment Head</span>
						</label>
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							required
							bind:value={user.paymentHead}
						>
							<option value="" selected disabled>Select</option>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>
					<div class="form-control">
						<label for="lname" class="label">
							<span class="label-text">Contact No.</span>
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
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button on:click={updateUser} type="submit" class="btn btn-primary mx-1 px-5">Save</button
					>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
					<button on:click={deleteUser} type="submit" class="btn btn-warning mx-1 text-white"
						>Delete</button
					>
				</div>
			</div>
		</div>
	</main>
{/if}
