<script>
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		addDoc,
		where,
		getDocs
	} from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';

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
		role: 'Resident',
		paymentStatus: 'Unpaid',
		paymentHead: '',
		isPending: true
	};

	let empty = {};

	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];

	let showOTP = false;
	let userOTP = '';
	let OTP = '';

	const digits = '0123456789';

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

	async function sendOTP() {
		if (
			!account.email ||
			!account.password ||
			!account.passwordcheck ||
			!account.firstname ||
			!account.lastname ||
			!account.addressBlock ||
			!account.addressLot ||
			!account.addressStreet ||
			!account.contactNumber ||
			!account.paymentHead
		) {
			if (!account.email) {
				empty.email = true;
			}
			if (!account.password) {
				empty.password = true;
			}
			if (!account.passwordcheck) {
				empty.passwordcheck = true;
			}
			if (!account.firstname) {
				empty.firstname = true;
			}
			if (!account.lastname) {
				empty.lastname = true;
			}
			if (!account.addressBlock) {
				empty.addressBlock = true;
			}
			if (!account.addressLot) {
				empty.addressLot = true;
			}
			if (!account.addressStreet) {
				empty.addressStreet = true;
			}
			if (!account.contactNumber) {
				empty.contactNumber = true;
			}
			if (!account.paymentHead) {
				empty.paymentHead = true;
			}
			setTimeout(function () {
				empty = {};
			}, 2000);
			return;
		}
		if (account.password.length < 6) {
			empty.passwordKulang = true;
			setTimeout(function () {
				empty = {};
			}, 2000);
			return;
		}
		if (account.password !== account.passwordcheck) {
			empty.passwordMatch = true;
			setTimeout(function () {
				empty = {};
			}, 2000);
			return;
		}
		OTP = '';
		const accountsQuery = query(collection(db, 'accounts'), where('email', '==', account.email));
		const accountsSnapshot = await getDocs(accountsQuery);
		if (accountsSnapshot.docs.length > 0) {
			empty.emailIsUsed = true;
			setTimeout(function () {
				empty = {};
			}, 2000);
			return;
		}
		for (let i = 0; i < 6; i++) {
			OTP += digits[Math.floor(Math.random() * 10)];
		}
		try {
			await sendEmail({
				to: account.email,
				subject: 'Your OTP code',
				html: `<h1>Your OTP is: ${OTP}</h1>`
			});
			showOTP = true;
			toast.success('OTP sent');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending OTP');
		}
	}

	async function confirmOTP() {
		if (userOTP !== OTP) {
			toast.error('Incorrect OTP');
			return;
		}
		if (!userOTP) {
			toast.error('OTP required');
			return;
		}
		try {
			await addDoc(collection(db, 'pendingAccounts'), {
				pendingEmail: account.email,
				pendingPassword: account.password,
				pendingFirstname: account.firstname.trim().toLowerCase(),
				pendingFirstNameDisplay: account.firstname,
				pendingLastname: account.lastname.trim().toLowerCase(),
				pendingLastNameDisplay: account.lastname,
				pendingAddressBlock: account.addressBlock,
				pendingAddressLot: account.addressLot,
				pendingAddressStreet: account.addressStreet,
				pendingContactNumber: account.contactNumber,
				pendingRole: account.role,
				pendingPaymentStatus: account.paymentStatus,
				pendingPaymentHead: account.paymentHead,
				isPending: account.isPending
			});
			toast.success('Creation of Account Request Sent');
			await goto('/login');
		} catch (error) {
			console.log(error);
			toast.error('Error in Creating an Account');
		}
	}

	$: getStreet(streetQuery);
</script>

<svelte:head>
	<title>Create Account - Southview Homes 3</title>
</svelte:head>

{#if showOTP}
	<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
		<div class="bg-white rounded-lg shadow-lg p-8 w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
			<h2 class="text-2xl font-bold mb-4 text-center">Enter OTP</h2>
			<form class="mb-4 flex flex-col items-center" on:submit|preventDefault={confirmOTP}>
				<div class="w-full mb-4">
					<label class="block text-gray-700 font-bold mb-2" for="otp">OTP</label>
					<input
						class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						type="text"
						placeholder="Enter OTP"
						autocomplete="off"
						maxlength="6"
						bind:value={userOTP}
					/>
				</div>
				<div class="w-full flex flex-col md:flex-row items-center justify-between">
					<button
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:mr-2"
						type="submit">Submit</button
					>
					<button
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:mr-2"
						type="button"
						on:click={sendOTP}>Resend OTP</button
					>
					<button
						class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						type="button"
						on:click={() => (showOTP = false)}>Cancel</button
					>
				</div>
			</form>
		</div>
	</div>
{:else}
	<main>
		<div class="min-h-screen hero bg-base-200 py-8">
			<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
				<div class="mt-2">
					<h1 class="text-2xl">Create Account</h1>
				</div>
				<form on:submit|preventDefault={sendOTP}>
					<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-2">
						<div class="form-control">
							<label for="fname" class="label">
								<span class="label-text">First Name</span>
							</label>
							{#if empty.firstname}
								<p class="text-red-500 text-sm italic">First Name is required</p>
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
								<p class="text-red-500 text-sm italic">Last Name is required</p>
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
								<p class="text-red-500 text-sm italic">Block is required</p>
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
								<p class="text-red-500 text-sm italic">Lot is required</p>
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
								<p class="text-red-500 text-sm italic">Street is required</p>
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
					<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
						<div class="form-control">
							<label for="fname" class="label">
								<span class="label-text">E-mail Address</span>
							</label>
							{#if empty.email}
								<p class="text-red-500 text-sm italic">Email is required</p>
							{/if}
							{#if empty.emailIsUsed}
								<p class="text-red-500 text-sm italic">Email is already used</p>
							{/if}
							<input
								type="text"
								placeholder="juandelacruz@gmail.com"
								name="email"
								class="input input-bordered"
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
								<p class="text-red-500 text-sm italic">Password is required</p>
							{/if}
							{#if empty.passwordKulang}
								<p class="text-red-500 text-sm italic">Password must be at least 6 characters</p>
							{/if}
							<input
								class="input input-bordered"
								type="password"
								placeholder="Password"
								bind:value={account.password}
							/>
						</div>
						<div class="form-control">
							<label for="cpassword" class="label">
								<span class="label-text">Confirm Password</span>
							</label>
							{#if empty.passwordcheck}
								<p class="text-red-500 text-sm italic">Confirm Password is required.</p>
							{/if}
							{#if empty.passwordMatch}
								<p class="text-red-500 text-sm italic">Password do not match</p>
							{/if}
							<input
								class="input input-bordered"
								type="password"
								placeholder="Confirm Password"
								bind:value={account.passwordcheck}
							/>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-6 mt-6 md:grid-cols-3">
						<div class="form-control">
							<label for="paymentHead" class="label">
								<span class="label-text">Payment Head</span>
							</label>
							{#if empty.paymentHead}
								<p class="text-red-500 text-sm italic">Payment Head is required</p>
							{/if}
							<div class="mb-3">
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
						</div>
						<div class="form-control">
							<label for="lname" class="label">
								<span class="label-text">Contact No.</span>
							</label>
							{#if empty.contactNumber}
								<p class="text-red-500 text-sm italic">Contact number is required</p>
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
						<a href="/login" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
					</div>
				</form>
			</div>
		</div>
	</main>
{/if}
