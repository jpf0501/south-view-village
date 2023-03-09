<script>
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import { onSnapshot, query, collection, orderBy, where, getDocs } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import toast from 'svelte-french-toast';

	let account = {
		email: '',
		password: '',
		passwordcheck: '',
		firstname: '',
		lastname: '',
		addressBlock: '',
		addressLot: '',
		addressStreet: '',
		contactNumber: '',
		role: '',
		paymentHead: '',
		paymentStatus: 'Unpaid'
	};
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];

	let empty = {};
	let errors = {};

	const blockValue = Array.from({ length: 23 }, (_, i) => ({
		value: i + 1
	}));

	const lotValue = Array.from({ length: 26 }, (_, i) => ({
		value: i + 1
	}));

	async function getStreet() {
		const unsubscribe = onSnapshot(streetQuery, (querySnapshot) => {
			listOfStreets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function submitHandler() {
		try {
			const regex = /^[a-zA-Z -]*$/;
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const accountsQuery = query(collection(db, 'accounts'), where('email', '==', account.email));
			const accountsSnapshot = await getDocs(accountsQuery);

			const requiredFields = [
				'email',
				'password',
				'passwordcheck',
				'firstname',
				'lastname',
				'addressBlock',
				'addressLot',
				'addressStreet',
				'contactNumber',
				'role'
			];

			empty = requiredFields.reduce((acc, field) => {
				if (!account[field]) acc[field] = true;
				return acc;
			}, {});

			if (
				!emailRegex.test(account.email) ||
				account.password.length < 6 ||
				account.password !== account.passwordcheck ||
				accountsSnapshot.docs.length > 0 ||
				!regex.test(account.firstname) ||
				!regex.test(account.lastname) ||
				account.paymentHead.length === 0
			) {
				errors = {
					invalidEmail: !emailRegex.test(account.email),
					passwordKulang: account.password.length < 6,
					passwordNotMatch: account.password !== account.passwordcheck,
					emailIsUsed: accountsSnapshot.docs.length > 0,
					invalidFirstname: !regex.test(account.firstname),
					invalidLastname: !regex.test(account.lastname),
					paymentHead: account.paymentHead.length === 0
				};
				Object.assign(empty, errors);
				setTimeout(function () {
					empty = {};
					errors = {};
				}, 2000);
				return;
			}
			const response = await fetch('/api/accounts', {
				method: 'POST',
				body: JSON.stringify({
					email: account.email,
					password: account.password,
					firstname: account.firstname.trim().toLowerCase(),
					firstNameDisplay: account.firstname,
					lastname: account.lastname.trim().toLowerCase(),
					lastNameDisplay: account.lastname,
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
			console.log(result);
			toast.success('Account created!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.error('Error in creating an account!');
		}
	}

	$: getStreet(streetQuery);
</script>

<svelte:head>
	<title>Create Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

<main>
	<div class="min-h-screen hero bg-base-200 py-8">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Create Account</h1>
			</div>
			<form on:submit|preventDefault={submitHandler}>
				<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">First Name</span>
						</label>
						{#if empty.firstname}
							<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
						{:else if empty.invalidFirstname}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
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
						<label for="lname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						{#if empty.lastname}
							<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
						{:else if empty.invalidLastname}
							<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
						{/if}
						<input
							type="text"
							placeholder="Dela Cruz"
							name="lname"
							class="input input-bordered"
							bind:value={account.lastname}
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-4 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						{#if empty.addressBlock}
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
						{#if empty.addressLot}
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
						{#if empty.addressStreet}
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
						{#if empty.email}
							<p class="text-red-500 text-sm italic mb-1">Email is required</p>
						{:else if empty.emailIsUsed}
							<p class="text-red-500 text-sm italic mb-1">Email is already used</p>
						{:else if empty.invalidEmail}
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
						{#if empty.password}
							<p class="text-red-500 text-sm italic mb-1">Password is required</p>
						{:else if empty.passwordKulang}
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
						{#if empty.passwordcheck}
							<p class="text-red-500 text-sm italic mb-1">Confirm Password is required.</p>
						{:else if empty.passwordNotMatch}
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
						{#if empty.role}
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
						{#if empty.paymentHead}
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
						{#if empty.contactNumber}
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
					<button type="submit" class="btn btn-primary mx-1 px-6">Create</button>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
				</div>
			</form>
		</div>
	</div>
</main>
