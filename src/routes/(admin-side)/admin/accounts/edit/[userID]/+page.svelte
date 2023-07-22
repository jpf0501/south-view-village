<script>
	import { db } from '$lib/firebase/client';
	import { getDocs, query, collection, orderBy, getDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { userStore } from '$lib/store.js';
	import Confirmation from '../../../../../../lib/Components/Confirmation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { userID } = data;

	let user = null;
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];
	let middleInitial = false;
	let middlePrevious = '';
	let confirmation = false;
	let confirmationText;
	let handleWhat

	let errors = {};

	const blockValue = Array.from({ length: 23 }, (_, i) => ({
		value: i + 1
	}));

	const lotValue = Array.from({ length: 26 }, (_, i) => ({
		value: i + 1
	}));

	async function handleAccountUpdate() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		handleWhat = "Update"
		confirmationText = `Do you want to save changes in this account "${user.firstNameDisplay} ${user.lastNameDisplay}"`;
		confirmation = true;
	}

	async function handleAccountDelete() {
		handleWhat = "Delete"
		confirmationText = `Do you want to delete this account "${user.firstNameDisplay} ${user.lastNameDisplay}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		if(handleWhat === "Update"){
			await updateUser()
		} else if(handleWhat === "Delete"){
			await deleteUser()
		}
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', userID));
		user = snapshot.data();
		user.firstname = user.firstNameDisplay;
		user.lastname = user.lastNameDisplay;
		user.middlename = user.middleNameDisplay;
		middleInitial = (user.middlename == ' ') ? true : false
		console.log(user.middlename)
	}

	async function getStreet() {
		const streetSnapshot = await getDocs(streetQuery);
		listOfStreets = streetSnapshot.docs.map((doc) => doc.data());
	}

	async function checkInput() {
		const regex = /^[a-zA-Z -\u00f1\u00d1]*$/;
		const middleHash = /^[a-zA-Z \u00f1\u00d1]*$/;
		errors = {
			firstname: !user.firstNameDisplay,
			lastname: !user.lastNameDisplay,
			middlename: middleInitial ? user.middleNameDisplay == '' : !user.middleNameDisplay,
			contactNumber: !user.contactNumber,
			invalidFirstname: !regex.test(user.firstNameDisplay),
			invalidLastname: !regex.test(user.lastNameDisplay),
			invalidMiddlename: !middleHash.test(user.middleNameDisplay)
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function updateUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		let userCred = snapshot.data();

		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		user.firstname = user.firstNameDisplay.trim().toLowerCase();
		user.lastname = user.lastNameDisplay.trim().toLowerCase();
		user.middlename = user.middleNameDisplay.trim().toLowerCase();
		user.firstNameDisplay = user.firstNameDisplay.trim()
		user.lastNameDisplay = user.lastNameDisplay.trim()
		user.middleNameDisplay = user.middleNameDisplay.trim()

		try {
			await updateDoc(doc(db, 'accounts', userID), user);
			// await addDoc(collection(db, 'adminlogs'), {
			// 	activity: user.firstNameDisplay + " " + user.lastNameDisplay + " edited account info in Accounts module.",
			// 	pageRef: 'Account',
			// 	date: serverTimestamp()
			// });
			toast.success('User has been updated!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating user!');
		}
	}

	async function deleteUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		let userCred = snapshot.data();
		try {
			await fetch('/api/accounts/', { method: 'DELETE', body: JSON.stringify({ uid: userID }) });
			await addDoc(collection(db, 'adminlogs'), {
				activity: userCred.firstNameDisplay + " " + userCred.lastNameDisplay + " deleted account in Accounts module.",
				pageRef: 'Account',
				date: serverTimestamp()
			});
			toast.success('User deleted!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.success('Error in deleting user!');
		}
	}

	async function middleHandler() {
		if (!middleInitial) {
			middleInitial = true
			middlePrevious = user.middleNameDisplay;
			user.middleNameDisplay = ' ';
		} else {
			middleInitial = false
			middlePrevious = user.middleNameDisplay;
			user.middleNameDisplay = user.middlename;
		}
	}

	getUser();
	getStreet(streetQuery);
</script>

<svelte:head>
	<title>Edit Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>
{#if user}
	<main>
		<form class="min-h-screen hero bg-base-200">
			<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
				<h1 class="text-2xl mt-2">Edit Account</h1>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
					<div class="form-control">
						<label for="lname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						{#if errors.lastname}
							<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
						{:else if errors.invalidLastname}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
						{/if}
						<input
							type="text"
							name="lname"
							class="input input-bordered"
							bind:value={user.lastNameDisplay}
						/>
					</div>
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">First Name</span>
						</label>
						{#if errors.firstname}
							<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
						{:else if errors.invalidFirstname}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
						{/if}
						<input
							type="text"
							name="fname"
							class="input input-bordered"
							bind:value={user.firstNameDisplay}
						/>
					</div>
					<div class="form-control">
						<label for="mname" class="label">
							<span class="label-text">Middle Name</span>
						</label>
						{#if errors.middlename}
							<p class="text-red-500 text-sm italic mb-1">Middle Name is required</p>
						{:else if errors.invalidMiddlename}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
						{/if}
						{#if middleInitial == false}
						<input
							type="text"
							placeholder="Santos"
							name="lname"
							class="input input-bordered"
							bind:value={user.middleNameDisplay}
						/>
						{:else}
						<input
							type="text"
							placeholder="Santos"
							name="lname"
							class="input input-bordered"
							disabled
						/>
						{/if}
						<div class="flex items-center mt-5">
							<input id="checkbox" checked={middleInitial} on:click={middleHandler} type="checkbox" class="checkbox checkbox-primary">
							<label for="checkbox" class="ml-2 text-sm font-medium">No middle name</label>
						</div>
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
						{#if errors.contactNumber}
							<p class="text-red-500 text-sm italic mb-1">Contact number is required</p>
						{/if}
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
					<button on:click={handleAccountUpdate} type="button" class="btn btn-primary mx-1 px-5">Save</button>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
					<button on:click={handleAccountDelete} type="button" class="btn btn-warning mx-1 text-white"
						>Delete</button
					>
				</div>
			</div>
		</form>
	</main>
{/if}
