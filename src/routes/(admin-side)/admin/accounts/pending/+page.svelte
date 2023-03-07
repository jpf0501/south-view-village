<script>
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		where,
		doc,
		updateDoc,
		getDocs
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import Pagination from '../../Pagination.svelte';
	import toast from 'svelte-french-toast';

	let listOfUsers = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let pendingAccountsQuery = query(
		collection(db, 'pendingAccounts'),
		where('isPending', '==', true)
	);

	let noResult = false;

	let currentPage = 1;
	let pageSize = 10;
	let totalRecords = 1;
	let totalPages = 0;

	let isApproved = '';

	async function getPendingAccounts(pendingAccountsQuery, page, pageSize) {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const unsubscribe = onSnapshot(pendingAccountsQuery, (querySnapshot) => {
			listOfUsers = querySnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.slice(startIndex, endIndex);
		});
		listOfUsers.length === 0 ? (noResult = true) : (noResult = false);
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		pendingAccountsQuery = query(
			collection(db, 'pendingAccounts'),
			where('isPending', '==', true),
			orderBy(sortByField, 'asc')
		);
	}

	async function searchPendingAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		pendingAccountsQuery = query(
			collection(db, 'pendingAccounts'),
			where('isPending', '==', true),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	async function resetButton() {
		pendingAccountsQuery = query(collection(db, 'pendingAccounts'), where('isPending', '==', true));
		searchByValue = '';
	}

	async function approval(
		pendingID,
		pendingEmail,
		pendingPassword,
		pendingFirstname,
		pendingFirstNameDisplay,
		pendingLastname,
		pendingLastNameDisplay,
		pendingContactNumber,
		pendingAddressBlock,
		pendingAddressLot,
		pendingAddressStreet,
		pendingRole,
		pendingPaymentStatus,
		pendingPaymentHead
	) {
		if (isApproved) {
			try {
				const accountsQuery = query(collection(db, 'accounts'), where('email', '==', pendingEmail));
				const accountsSnapshot = await getDocs(accountsQuery);
				if (accountsSnapshot.docs.length > 0) {
					toast.error('Email already exists!');
				} else {
					const response = await fetch('/api/pendingAccounts', {
						method: 'POST',
						body: JSON.stringify({
							email: pendingEmail,
							password: pendingPassword,
							firstname: pendingFirstname,
							firstNameDisplay: pendingFirstNameDisplay,
							lastname: pendingLastname,
							lastNameDisplay: pendingLastNameDisplay,
							addressBlock: pendingAddressBlock,
							addressLot: pendingAddressLot,
							addressStreet: pendingAddressStreet,
							contactNumber: pendingContactNumber,
							role: pendingRole,
							paymentStatus: pendingPaymentStatus,
							paymentHead: pendingPaymentHead
						})
					});
					const result = await response.json();
					console.log(result);

					const pendingAccountsRef = doc(db, 'pendingAccounts', pendingID);
					const data = {
						isPending: false
					};
					await updateDoc(pendingAccountsRef, data);
					toast.success('Account approved!');
				}
			} catch (error) {
				console.log(error);
				toast.error("Error in approving account!");
			}
		} else {
			try {
				const pendingAccountsRef = doc(db, 'pendingAccounts', pendingID);
				const data = {
					isPending: false
				};
				await updateDoc(pendingAccountsRef, data);
				toast.success('Account disaaproved!');
			} catch (error) {}
			console.log(error);
			toast.error('Error in disapproving an account!');
		}
	}

	$: {
		getPendingAccounts(pendingAccountsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(pendingAccountsQuery, (querySnapshot) => {
			totalRecords = querySnapshot.docs.length;
			totalPages = Math.ceil(totalRecords / pageSize);
		});
		onDestroy(() => unsubscribe());
	}
	function goToPage(page) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Pending Accounts - Southview Homes 3 Admin Panel</title>
</svelte:head>

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
			<option value="pendingEmail">Email</option>
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
						<th class="text-lg">Name</th>
						<th class="text-lg">Address</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact No.</th>
						<th class="text-lg">Role</th>
						<th class="text-lg">Payment Head</th>
						<th />
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="py-24 text-center" colspan="8">No Pending Account/s to Approve Found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfUsers as user, i}
						<tr class="hover">
							<td>{i + (currentPage - 1) * pageSize + 1}</td>
							<td>{user.pendingFirstNameDisplay + ' ' + user.pendingLastNameDisplay}</td>
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
							<td>{user.pendingRole}</td>
							{#if user.pendingPaymentHead}
								<td class="text-center">Yes</td>
							{:else}
								<td class="text-center">No</td>
							{/if}
							<td
								><form
									on:submit|preventDefault={approval(
										user.id,
										user.pendingEmail,
										user.pendingPassword,
										user.pendingFirstname,
										user.pendingFirstNameDisplay,
										user.pendingLastname,
										user.pendingLastNameDisplay,
										user.pendingContactNumber,
										user.pendingAddressBlock,
										user.pendingAddressLot,
										user.pendingAddressStreet,
										user.pendingRole,
										user.pendingPaymentStatus,
										user.pendingPaymentHead
									)}
								>
									<button
										on:click={() => (isApproved = true)}
										type="submit"
										class="btn btn-success text-white">Approve</button
									>
									<button
										on:click={() => (isApproved = false)}
										type="submit"
										class="btn btn-error text-white">Dissaprove</button
									>
								</form></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#if noResult}
			<div class="w-full mx-auto">No Pending Account/s to Approve Found</div>
		{/if}
		{#each listOfUsers as user}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">
						{user.pendingFirstNameDisplay + ' ' + user.pendingLastNameDisplay}
					</h2>
					<div>
						<span class="my-1 font-bold">Role:</span>
						{user.pendingRole}
					</div>
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
						<form
							on:submit|preventDefault={approval(
								user.id,
								user.pendingEmail,
								user.pendingPassword,
								user.pendingFirstname,
								user.pendingFirstNameDisplay,
								user.pendingLastname,
								user.pendingLastNameDisplay,
								user.pendingContactNumber,
								user.pendingAddressBlock,
								user.pendingAddressLot,
								user.pendingAddressStreet,
								user.pendingRole,
								user.pendingPaymentStatus,
								user.pendingPaymentHead
							)}
							class="py-3"
						>
							<button
								on:click={() => (isApproved = true)}
								type="submit"
								class="btn btn-success text-white">Approve</button
							>
							<button
								on:click={() => (isApproved = false)}
								type="submit"
								class="btn btn-error text-white">Dissaprove</button
							>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-14">
		<Pagination {currentPage} {totalPages} onPageChange={goToPage} />
	</div>
	
</div>

