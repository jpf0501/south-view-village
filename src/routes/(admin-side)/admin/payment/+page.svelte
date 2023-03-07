<script>
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		where,
		updateDoc,
		doc,
		getDocs
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { createPaymentLink, sendEmail } from '$lib/utils';
	import Pagination from '../Pagination.svelte';
	import toast from 'svelte-french-toast';

	const monthName = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const date = new Date();
	const currentMonth = monthName[date.getMonth()];
	const currentYear = date.getFullYear();

	let listOfUsers = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let accountsQuery = query(collection(db, 'accounts'), where('paymentHead', '==', true));

	let noResult = false;

	let currentPage = 1;
	let pageSize = 10;
	let totalRecords = 1;
	let totalPages = 0;

	async function getAccounts(accountsQuery, page, pageSize) {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
			listOfUsers = querySnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.slice(startIndex, endIndex);
		});
		listOfUsers.length === 0 ? (noResult = true) : (noResult = false);
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		accountsQuery = query(
			collection(db, 'accounts'),
			where('paymentHead', '==', true),
			orderBy(sortByField, 'asc')
		);
	}

	async function searchAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		accountsQuery = query(
			collection(db, 'accounts'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			where('paymentHead', '==', true)
		);
	}

	async function sendPaymentEmail(paymentEmail, paymentID) {
		console.log(paymentID);
		try {
			const paymentLinkData = await createPaymentLink(
				'Southview Homes 3 Monthly Dues',
				50000,
				paymentID
			);
			const checkoutURL = paymentLinkData.data.attributes.checkout_url;
			const result = await sendEmail({
				to: paymentEmail,
				subject: 'Southview Homes 3 Monthly Dues Payment Notice',
				html: `<h1>This is the link for payment for monthly dues of ${currentMonth} ${currentYear}: <a href=${checkoutURL}>Click here</a></h1>`
			});
			console.log(JSON.stringify(result));
			toast.success('Payment has been sent!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending payment!');
		}
	}

	async function resetButton() {
		accountsQuery = query(collection(db, 'accounts'), where('paymentHead', '==', true));
		searchByValue = '';
	}

	async function resetStatus() {
		let text = 'Would you like to reset payment status?';
		if (confirm(text) == true) {
			const accountQuery = query(collection(db, 'accounts'));
			const snapshot = await getDocs(accountQuery);
			for (let i = 0; i < snapshot.docs.length; i++) {
				const docRef = doc(db, 'accounts', snapshot.docs[i].id);
				await updateDoc(docRef, { paymentStatus: 'Unpaid' });
			}
			toast.success('All payment status has been reset!');
		}
	}

	$: {
		getAccounts(accountsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
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
	<title>Payment - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Payment</h1>
	<div class="flex justify-end">
		<a href="/admin/payment/history" class="btn btn-primary ">Payment History</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchAccounts}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstname">Name</option>
					<!-- <option value="addressBlock">Block</option>
					<option value="addressLot">Lot</option>
					<option value="addressStreet">Street</option> -->
					<option value="email">Email</option>
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
			<option value="firstname">Name</option>
			<option value="addressBlock">Block</option>
			<option value="addressLot">Lot</option>
			<option value="addressStreet">Street</option>
			<option value="email">Email</option>
		</select>

		<button class="btn btn-primary my-4" on:click={resetStatus}>Reset Payment Status</button>
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
						<th class="text-lg">Payment Status</th>
						<th />
						<th />
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="py-24 text-center" colspan="8">No User/s Found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfUsers as user, i}
						<tr class="hover">
							<td>{i + (currentPage - 1) * pageSize + 1}</td>
							<td>{user.firstNameDisplay + ' ' + user.lastNameDisplay}</td>
							<td
								>{'Block ' +
									user.addressBlock +
									' Lot ' +
									user.addressLot +
									' ' +
									user.addressStreet +
									' Street'}</td
							>
							<td>{user.email}</td>
							<td>{user.contactNumber}</td>
							<td>{user.paymentStatus}</td>
							<td />
							<td>
								{#if user.paymentStatus == 'Unpaid'}
									<button
										on:click={sendPaymentEmail(user.email, user.id)}
										type="button"
										class="btn btn-primary">Send Payment</button
									>
								{:else}
									<button type="button" class="btn btn-primary" disabled>Send Payment</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#if noResult}
			<div class="w-full mx-auto">No user/s Found</div>
		{/if}
		{#each listOfUsers as user}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{user.firstNameDisplay + ' ' + user.lastNameDisplay}</h2>
					<div>
						<span class="my-1 font-bold">Role:</span>
						{user.role}
					</div>
					<div>
						<span class="my-1 font-bold">Address:</span>
						{'Block ' +
							user.addressBlock +
							' Lot ' +
							user.addressLot +
							' ' +
							user.addressStreet +
							' Street'}
					</div>
					<div>
						<span class="my-1 font-bold">E-mail Address:</span>
						{user.email}
					</div>
					<div class="card-actions justify-end">
						<a href={'/admin/accounts/edit/' + user.id} class="btn glass text-white"
							><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
								/></svg
							></a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- pagination button -->
<Pagination {currentPage} {totalPages} onPageChange={goToPage} />
