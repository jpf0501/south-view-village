<script>
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		where,
		doc,
		updateDoc,
		getDocs,
		getDoc,
		addDoc,
		serverTimestamp,
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { sendEmail } from '$lib/utils';
	import { onDestroy } from 'svelte';
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../lib/Components/Confirmation.svelte';
	import { userStore } from '$lib/store.js';

	let listOfUsers = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let pendingAccountsQuery = query(
		collection(db, 'pendingAccounts'),
		where('status', '==', 'Pending')
	);

	let pendingAccountStatus = '';
	let confirmation = false;
	let confirmationText;
	let accountInfo;

	let unsubscribe = () => {};

	async function handleApprovedAccount(user) {
		accountInfo = user;
		pendingAccountStatus = 'Approved';
		confirmationText = `Do you want to approved the account creation of "${accountInfo.pendingFirstNameDisplay} ${accountInfo.pendingLastNameDisplay}"`;
		confirmation = true;
	}

	async function handleDisapprovedAccount(user) {
		accountInfo = user;
		pendingAccountStatus = 'Disapproved';
		confirmationText = `Do you want to disapproved the account creation of "${accountInfo.pendingFirstNameDisplay} ${accountInfo.pendingLastNameDisplay}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		await approval();
		await sendUpdateAccountStatusToEmail();
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function changeSortBy() {
		pendingAccountsQuery = query(
			collection(db, 'pendingAccounts'),
			where('status', '==', 'Pending'),
			orderBy(sortByField, 'asc')
		);
	}

	async function searchPendingAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		pendingAccountsQuery = query(
			collection(db, 'pendingAccounts'),
			where('status', '==', 'Pending'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	async function resetButton() {
		pendingAccountsQuery = query(
			collection(db, 'pendingAccounts'),
			where('status', '==', 'Pending')
		);
		searchByValue = '';
	}

	async function approval() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		let user = snapshot.data();

		if (pendingAccountStatus === 'Approved') {
			try {
				const accountsQuery = query(
					collection(db, 'accounts'),
					where('email', '==', accountInfo.pendingEmail)
				);
				const accountsSnapshot = await getDocs(accountsQuery);
				if (accountsSnapshot.docs.length > 0) {
					toast.error('Email already exists!');
					return;
				}
				const response = await fetch('/api/pendingAccounts', {
					method: 'POST',
					body: JSON.stringify({
						email: accountInfo.pendingEmail,
						password: accountInfo.pendingPassword,
						firstname: accountInfo.pendingFirstname,
						firstNameDisplay: accountInfo.pendingFirstNameDisplay,
						lastname: accountInfo.pendingLastname,
						lastNameDisplay: accountInfo.pendingLastNameDisplay,
						middlename: accountInfo.pendingMiddlename,
						middleNameDisplay: accountInfo.pendingMiddleNameDisplay,
						addressBlock: accountInfo.pendingAddressBlock,
						addressLot: accountInfo.pendingAddressLot,
						addressStreet: accountInfo.pendingAddressStreet,
						contactNumber: accountInfo.pendingContactNumber,
						paymentHead: accountInfo.pendingPaymentHead
					})
				});
				const result = await response.json();
				// console.log(result);
				const pendingAccountsRef = doc(db, 'pendingAccounts', accountInfo.id);
				const data = {
					status: 'Approved'
				};
				await updateDoc(pendingAccountsRef, data);
				await addDoc(collection(db, 'adminlogs'), {
					activity: user.firstNameDisplay + " " + user.lastNameDisplay + " approved account creation request in Accounts module.",
					pageRef: 'Account',
					date: serverTimestamp()
				});
				toast.success('Account approved!');
			} catch (error) {
				console.log(error);
				toast.error('Error in approving account!');
			}
		} else if (pendingAccountStatus === 'Disapproved') {
			try {
				const pendingAccountsRef = doc(db, 'pendingAccounts', accountInfo.id);
				const data = {
					status: 'Disapproved'
				};
				await updateDoc(pendingAccountsRef, data);
				await addDoc(collection(db, 'adminlogs'), {
					activity: user.firstNameDisplay + " " + user.lastNameDisplay + " disapproved account creation request in Accounts module.",
					pageRef: 'Account',
					date: serverTimestamp()
				});
				toast.success('Account disapproved!');
			} catch (error) {
				console.log(error);
				toast.error('Error in disapproving an account!');
			}
		}
	}

	async function sendUpdateAccountStatusToEmail() {
		let message;

		if (pendingAccountStatus === 'Approved') {
			message = `
            <p>We are pleased to inform you that your account has been approved! You can now access your account.</p>
        `;
		} else if (pendingAccountStatus === 'Disapproved') {
			message = `
            <p>We regret to inform you that we were not able to approve your account at this time.</p>
        `;
		}
		try {
			await sendEmail({
				to: accountInfo.pendingEmail,
				subject: 'Southview Homes 3 Account Approval Status',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p>Account Status Update</p>
				<p>Dear ${accountInfo.pendingFirstNameDisplay} ${accountInfo.pendingLastNameDisplay},</p>
				<p>We have reviewed your account application and are writing to inform you of your account approval status.</p>
				<p>${message}</p>
				<p>If you have any questions or concerns, please do not hesitate to contact us. We are always here to help.</p>
				<p>Best regards,</p>
				<p>Soutview Homes 3</p>
				`
			});
			// toast.success("Update of account request send to email")
		} catch (error) {
			console.log(error);
			toast.error('Error of sending update of account status to email');
		}
	}

	function setUpRealtimeListener(pendingAccountsQuery) {
		unsubscribe();
		unsubscribe = onSnapshot(pendingAccountsQuery, (querySnapshot) => {
			listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
	}

	onDestroy(() => unsubscribe());
	$: setUpRealtimeListener(pendingAccountsQuery);
</script>

<svelte:head>
	<title>Pending Accounts - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>
<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Account Approval</h1>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchPendingAccounts}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="pendingFirstname">Firstame</option>
					<option value="pendingLastname">Lastname</option>
					<!-- <option value="addressBlock">Block</option>
					<option value="addressLot">Lot</option>
					<option value="addressStreet">Street</option> -->
					<option value="pendingEmail">Email</option>
				</select>
				<input
					type="search"
					placeholder="Search here"
					class="input input-bordered"
					bind:value={searchByValue}
				/>
			</form>

			<button on:click={resetButton} class="btn btn-primary my-4 mx-2">Reset</button>
		</div>

		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="pendingFirstname">First Name</option>
			<option value="pendingLastname">Last Name</option>
			<option value="pendingAddressBlock">Block</option>
			<option value="pendingAddressLot">Lot</option>
			<option value="pendingAddressStreet">Street</option>
			<!-- <option value="pendingEmail">Email</option> -->
		</select>

		<a class="btn btn-primary my-4" href="/admin/accounts">Go Back</a>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Address</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact No.</th>
						<th class="text-lg">Payment Head</th>
					</tr>
				</thead>
				<tbody>
					{#each listOfUsers as user, i}
						<tr class="hover">
							<td
								><form>
									<button
										on:click={handleApprovedAccount(user)}
										type="button"
										class="btn btn-success text-white">Approve</button
									>
									<button
										on:click={handleDisapprovedAccount(user)}
										type="button"
										class="btn btn-error text-white">Dissaprove</button
									>
								</form></td
							>
							<td>{i + 1}</td>
							<td
								>{user.pendingFirstNameDisplay +
									' ' +
									user.pendingMiddleNameDisplay +
									' ' +
									user.pendingLastNameDisplay}</td
							>
							<td
								>{'Block ' +
									user.pendingAddressBlock +
									' Lot ' +
									user.pendingAddressLot +
									' ' +
									user.pendingAddressStreet +
									' Street'}</td
							>
							<td>{user.pendingEmail}</td>
							<td>{user.pendingContactNumber}</td>
							{#if user.pendingPaymentHead}
								<td class="text-center">Yes</td>
							{:else}
								<td class="text-center">No</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#each listOfUsers as user}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">
						{user.pendingFirstNameDisplay +
							' ' +
							user.pendingMiddleNameDisplay +
							' ' +
							user.pendingLastNameDisplay}
					</h2>
					<div>
						<span class="my-1 font-bold">Address:</span>
						{'Block ' +
							user.pendingAddressBlock +
							' Lot ' +
							user.pendingAddressLot +
							' ' +
							user.pendingAddressStreet +
							' Street'}
					</div>
					<div>
						<span class="my-1 font-bold">Payment Head:</span>
						{#if user.pendingPaymentHead}
							Yes
						{:else}
							No
						{/if}
					</div>
					<div>
						<span class="my-1 font-bold">E-mail Address:</span>
						{user.pendingEmail}
					</div>
					<div>
						<form class="py-3 flex flex-row justify-end gap-2">
							<button
								on:click={handleApprovedAccount(user)}
								type="submit"
								class="btn btn-success text-white">Approve</button
							>
							<button
								on:click={handleDisapprovedAccount(user)}
								type="submit"
								class="btn btn-error text-white">Dissaprove</button
							>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
