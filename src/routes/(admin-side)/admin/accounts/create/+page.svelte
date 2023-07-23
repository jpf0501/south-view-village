<script>
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import {
		getDocs,
		query,
		collection,
		orderBy,
		where,
		getDoc,
		doc,
	} from 'firebase/firestore';
	import { addLog } from '$lib/logs'
	import { userStore } from '$lib/store.js';
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../lib/Components/Confirmation.svelte';

	let account = {
		email: '',
		password: '',
		passwordcheck: '',
		firstname: '',
		lastname: '',
		middlename: '',
		addressBlock: '',
		addressLot: '',
		addressStreet: '',
		contactNumber: '',
		role: '',
		paymentHead: '',
		paymentStatus: 'Unpaid'
	};
	let errors = {};
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];
	let middleInitial = false;
	let confirmation = false;
	let confirmationText;

	const blockValue = Array.from({ length: 23 }, (_, i) => ({
		value: i + 1
	}));

	const lotValue = Array.from({ length: 26 }, (_, i) => ({
		value: i + 1
	}));

	async function handleSubmit() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		confirmationText = `Do you want to create account "${account.firstname} ${account.lastname}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		await createAccount()
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function getStreet() {
		const streetSnapshot = await getDocs(streetQuery);
		listOfStreets = streetSnapshot.docs.map((doc) => doc.data());
	}


	async function checkInput() {
		const regex = /^[a-zA-Z -]*$/;
		// must have at least 1 letter
		const firstnameRegex =
			account.firstname.length > 0 && /[a-zA-Z -\u00f1\u00d1]/.test(account.firstname);
		const lastnameRegex =
			account.lastname.length > 0 && /[a-zA-Z -\u00f1\u00d1]/.test(account.lastname);
		const middlenameRegex =
			account.middlename.length > 0 && /[a-zA-Z -\u00f1\u00d1]/.test(account.middlename);
		// must ba an email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const accountsQuery = query(collection(db, 'accounts'), where('email', '==', account.email));
		const accountsSnapshot = await getDocs(accountsQuery);
		errors = {
			email: !account.email,
			password: !account.password,
			passwordcheck: !account.passwordcheck,
			firstname: !account.firstname,
			lastname: !account.lastname,
			middlename: middleInitial ? !account.middlename == ' ' : !account.middlename,
			addressBlock: !account.addressBlock,
			addressLot: !account.addressLot,
			addressStreet: !account.addressStreet,
			role: !account.role,
			contactNumber: !account.contactNumber,
			paymentHead: account.paymentHead.length === 0,
			emailIsUsed: accountsSnapshot.docs.length > 0,
			invalidEmail: !emailRegex.test(account.email),
			invalidFirstnameRequired: !firstnameRegex,
			invalidLastnameRequired: !lastnameRegex,
			invalidMiddlenameRequired: middleInitial ? !account.middlename == ' ' : !middlenameRegex,
			invalidFirstname: !regex.test(account.firstname),
			invalidLastname: !regex.test(account.lastname),
			invalidMiddlename: !regex.test(account.middlename),
			passwordKulang: account.password.length < 6,
			passwordNotMatch: account.password !== account.passwordcheck
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function createAccount() {
		try {
			const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
			let user = snapshot.data();

			const response = await fetch('/api/accounts', {
				method: 'POST',
				body: JSON.stringify({
					email: account.email.trim(),
					password: account.password,
					firstname: account.firstname.trim().toLowerCase(),
					firstNameDisplay: account.firstname.trim(),
					middlename: middleInitial ? ' ' : account.middlename.trim().toLowerCase(),
					middleNameDisplay: middleInitial ? ' ' : account.middlename.trim(),
					lastname: account.lastname.trim().toLowerCase(),
					lastNameDisplay: account.lastname.trim(),
					addressBlock: account.addressBlock,
					addressLot: account.addressLot,
					addressStreet: account.addressStreet,
					contactNumber: account.contactNumber,
					role: account.role,
					paymentHead: account.paymentHead,
					paymentStatus: account.paymentStatus
				})
			});
			const result = await response.json();
			//activity logs
			addLog(`"Created account - ${account.firstname} ${account.lastname}"`,"Accounts")
			toast.success('Account created!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.error('Error in creating an account!');
		}
	}

	getStreet(streetQuery);
</script>

<svelte:head>
	<title>Create Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>
<main>
	<div class="min-h-screen hero bg-base-200 py-8">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Create Account</h1>
			</div>
			<form>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
					<div class="form-control">
						<label for="lname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						{#if errors.lastname}
							<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
						{:else if errors.invalidLastname}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
						{:else if errors.invalidLastnameRequired}
							<p class="text-red-500 text-sm italic mb-1">Lastname must have a letter</p>
						{/if}
						<input
							type="text"
							placeholder="Dela Cruz"
							name="lname"
							class="input input-bordered"
							bind:value={account.lastname}
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
						{:else if errors.invalidFirstnameRequired}
							<p class="text-red-500 text-sm italic mb-1">Firstname must have a letter</p>
						{/if}
						<input
							type="text"
							placeholder="Juan"
							name="fname"
							class="input input-bordered"
							bind:value={account.firstname}
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
						{:else if errors.invalidMiddlenameRequired}
							<p class="text-red-500 text-sm italic mb-1">Middle name must have a letter</p>
						{/if}
						{#if middleInitial == false}
							<input
								type="text"
								placeholder="Santos"
								name="lname"
								class="input input-bordered"
								bind:value={account.middlename}
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
							<input
								id="checkbox"
								bind:checked={middleInitial}
								type="checkbox"
								class="checkbox checkbox-primary"
							/>
							<label for="checkbox" class="ml-2 text-sm font-medium">No middle name</label>
						</div>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-1 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						{#if errors.addressBlock}
							<p class="text-red-500 text-sm italic mb-1">Block is required</p>
						{/if}
						<select class="select select-bordered w-full" bind:value={account.addressBlock}>
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
						{#if errors.addressLot}
							<p class="text-red-500 text-sm italic mb-1">Lot is required</p>
						{/if}
						<select class="select select-bordered w-full" bind:value={account.addressLot}>
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
						{#if errors.addressStreet}
							<p class="text-red-500 text-sm italic mb-1">Street is required</p>
						{/if}
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							bind:value={account.addressStreet}
						>
							<option value="" selected disabled>Select street</option>
							{#each listOfStreets as street}
								<option value={street.streetName}>{street.streetName}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-3">
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">E-mail Address</span>
						</label>
						{#if errors.email}
							<p class="text-red-500 text-sm italic mb-1">Email is required</p>
						{:else if errors.emailIsUsed}
							<p class="text-red-500 text-sm italic mb-1">Email is already used</p>
						{:else if errors.invalidEmail}
							<p class="text-red-500 text-sm italic mb-1">Invalid email</p>
						{/if}
						<input
							type="text"
							placeholder="juandelacruz@gmail.com"
							name="email"
							class="input input-bordered"
							autocomplete="email"
							bind:value={account.email}
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
					<div class="form-control">
						<label for="password" class="label">
							<span class="label-text">Password</span>
						</label>
						{#if errors.password}
							<p class="text-red-500 text-sm italic mb-1">Password is required</p>
						{:else if errors.passwordKulang}
							<p class="text-red-500 text-sm italic mb-1">Password must be at least 6 characters</p>
						{/if}
						<input
							class="input input-bordered"
							type="password"
							placeholder="Password"
							autocomplete="current-password"
							bind:value={account.password}
						/>
					</div>
					<div class="form-control">
						<label for="cpassword" class="label">
							<span class="label-text">Confirm Password</span>
						</label>
						{#if errors.passwordcheck}
							<p class="text-red-500 text-sm italic mb-1">Confirm Password is required.</p>
						{:else if errors.passwordNotMatch}
							<p class="text-red-500 text-sm italic mb-1">Password do not match</p>
						{/if}
						<input
							class="input input-bordered"
							type="password"
							placeholder="Confirm Password"
							autocomplete="new-password"
							bind:value={account.passwordcheck}
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-4">
					<div class="form-control">
						<label for="role" class="label">
							<span class="label-text">Role</span>
						</label>
						{#if errors.role}
							<p class="text-red-500 text-sm italic mb-1">Role is required</p>
						{/if}
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							bind:value={account.role}
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
						{#if errors.paymentHead}
							<p class="text-red-500 text-sm italic mb-1">Payment Head is required</p>
						{/if}
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							bind:value={account.paymentHead}
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
							bind:value={account.contactNumber}
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button on:click={handleSubmit} type="button" class="btn btn-primary mx-1 px-6"
						>Create Account</button
					>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
				</div>
			</form>
		</div>
	</div>
</main>
