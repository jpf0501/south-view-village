<script>
	import {
		onSnapshot,
		query,
		collection,
		orderBy,
		where,
		updateDoc,
		doc,
		addDoc,
		getDocs,
		serverTimestamp
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { createPaymentLink, sendEmail } from '$lib/utils';
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
	let showModal,
		showConfirm = false;
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let accountsQuery = query(
		collection(db, 'accounts'),
		where('paymentHead', '==', true),
		where('paymentStatus', '==', 'Unpaid')
	);
	let userFirst, userLast, userID, userEmail, userFee;

	let unsubscribe = () => {};

	let showPopUpForMarkAsPaid = false;
	let userInfo;
	let markFee = 0;

	function openModal(firstName, lastName, email, id) {
		userFirst = firstName;
		userLast = lastName;
		userID = id;
		userEmail = email;
		userFee = 500;
		showModal = true;
	}

	function openConfirmation() {
		showConfirm = true;
	}

	function closeModal() {
		showModal = false;
	}

	function closeConfirmation() {
		showConfirm = false;
	}

	async function changeSortBy() {
		accountsQuery = query(
			collection(db, 'accounts'),
			where('paymentHead', '==', true),
			where('paymentStatus', '==', 'Unpaid'),
			orderBy(sortByField, 'asc')
		);
	}

	async function searchAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		accountsQuery = query(
			collection(db, 'accounts'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			where('paymentHead', '==', true),
			where('paymentStatus', '==', 'Unpaid')
		);
	}

	async function sendPaymentEmail(paymentEmail, paymentID, paymentFee) {
		const mailFee = paymentFee;
		paymentFee = paymentFee + '00';
		paymentFee = parseFloat(paymentFee);
		try {
			const paymentLinkData = await createPaymentLink(
				'Southview Homes 3 Monthly Dues',
				paymentFee,
				paymentID
			);
			const checkoutURL = paymentLinkData.data.attributes.checkout_url;
			const result = await sendEmail({
				to: paymentEmail,
				subject: `Southview Homes 3 ${currentMonth} ${currentYear} Monthly Dues Payment Notice`,
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 Clubhouse, San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p><br/>We sent you this notice to inform you on the payment of your unpaid monthly dues for the period of ${currentMonth} ${currentYear}, which amounts to a total of PHP ${new Intl.NumberFormat().format(
					mailFee
				)}.00 in total. The above amount and period remains unpaid on the record. Please be informed that the purpose of collecting this fee is to fund the subdivision's monthly expenses, which include the following:
				<br/><br/>
				1) Security Guard Salary
				<br/>2) Street Lights
				<br/>3) Garbage Pick-up
				<br/>4) Maintenance Salary
				<p>To avoid inconveniences, we greatly appreciate if you could proceed with the payment of your unpaid dues on or before the appointed deadline. <p>You can pay your monthly dues by using the form provided <a href=${checkoutURL}>here</a>.</p>
				Should you have any kind of concern regarding your dues, please contact any of the HOA officers or send us an inquiry for any other clarifications.
				Please disregard this notice if you have settled already the said unpaid dues.
				Thank you.</p>
				<p>For other inquiries, feel free give us a call at 8330-4163 / 09063955407. You can also file for an inquiry at our <a href="https://ssv.vercel.app">website</a> or send us an email at <a href="mailto:southviewhomes3mail@gmail.com">southviewhomes3mail@gmail.com</a>.</p>
				<p><br/>Best regards,<br/>Southview Homes 3 Home Owners Association`
			});
			showModal = false;
			toast.success('Payment has been sent!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending payment!');
		}
	}

	async function markAsPaid() {
		// console.log(userInfo.id)
		// console.log(userInfo.contactNumber)
		//acount table
		if ((markFee < 500)) {
			toast.error('Invalid Mark Fee');
			return;
		}
		try {
			const accountRef = doc(db, 'accounts', userInfo.id);
			const data = {
				paymentStatus: 'Paid'
			};
			showPopUpForMarkAsPaid = false;
			await updateDoc(accountRef, data);
			toast.success('Account mark as paid!');
		} catch (error) {
			console.log(error);
			toast.error('Error in marking account as paid!');
		}
		//////payment table
		try {
			const newMarkFee = markFee * 100;
			await addDoc(collection(db, 'payments'), {
				addressBlock: userInfo.addressBlock,
				addressLot: userInfo.addressLot,
				addressStreet: userInfo.addressStreet,
				contact: userInfo.contactNumber,
				email: userInfo.email,
				firstName: userInfo.firstname,
				firstNameDisplay: userInfo.firstNameDisplay,
				lastName: userInfo.lastname,
				lastNameDisplay: userInfo.lastNameDisplay,
				paymentFee: newMarkFee,
				paymentTime: serverTimestamp()
			});
		} catch (error) {
			console.log(error);
			toast.error('Error in marking account payment as paid!');
		}
	}

	async function resetButton() {
		accountsQuery = query(
			collection(db, 'accounts'),
			where('paymentHead', '==', true),
			where('paymentStatus', '==', 'Unpaid')
		);
		searchByValue = '';
	}

	async function resetStatus() {
		closeConfirmation();
		const accountQuery = query(collection(db, 'accounts'), where('paymentHead', '==', true));
		const snapshot = await getDocs(accountQuery);
		for (let i = 0; i < snapshot.docs.length; i++) {
			const docRef = doc(db, 'accounts', snapshot.docs[i].id);
			await updateDoc(docRef, { paymentStatus: 'Unpaid' });
		}
		toast.success('All payment status has been reset!');
	}

	function setUpRealtimeListener(accountsQuery) {
		unsubscribe();
		unsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
			listOfUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
	}

	onDestroy(() => unsubscribe());
	$: setUpRealtimeListener(accountsQuery);
</script>

<svelte:head>
	<title>Payment - Southview Homes 3 Admin Panel</title>
</svelte:head>

<!-- modal -->

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
	>
		<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
		<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
			<div class="p-6">
				<h2 class="text-lg font-medium">Send Payment Form to {userFirst} {userLast}</h2>
				<p class="mt-6 text-sm text-gray-500">Enter payment fee (in Philippine peso)</p>
				<input
					type="text"
					placeholder="Enter amount"
					bind:value={userFee}
					class="mt-6 input input-bordered w-full max-w-xs"
				/>
			</div>
			<div class="flex justify-end px-6 gap-2 py-4">
				<button class="btn btn-primary" on:click={sendPaymentEmail(userEmail, userID, userFee)}
					>Send Payment</button
				>
				<button class="btn btn-error text-white" on:click={closeModal}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

{#if showConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
	>
		<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
		<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
			<div class="p-6">
				<p>
					Would you like to reset all of the resident's monthly dues payment status for this month? <span
						class="font-semibold">This action cannot be undone.</span
					>
				</p>
			</div>
			<div class="flex justify-end px-6 gap-2 py-4">
				<button class="btn btn-primary" on:click={resetStatus}>Reset Payment Status</button>
				<button class="btn btn-error text-white" on:click={closeConfirmation}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<!-- end modal -->

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Payment</h1>
	<div class="flex justify-end">
		<a href="/admin/payment/history" class="btn btn-primary ">View History</a>
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
					<option value="firstname">First Name</option>
					<option value="lastname">Last Name</option>
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
			<option value="firstname">Firstname</option>
			<option value="lastname">Lastname</option>
			<option value="addressBlock">Block</option>
			<option value="addressLot">Lot</option>
			<option value="addressStreet">Street</option>
			<!-- <option value="email">Email</option> -->
		</select>

		<button class="btn btn-primary my-4" on:click={openConfirmation}>Reset Payment Status</button>
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
					</tr>
				</thead>
				<tbody>
					{#each listOfUsers as user, i}
						<tr class="hover">
							<td>{i + 1}</td>
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
							<td>
								{#if user.paymentStatus == 'Unpaid'}
									<button
										on:click={() => {
											showPopUpForMarkAsPaid = true;
											userInfo = user;
										}}
										type="button"
										class="btn btn-primary">Mark as Paid</button
									>
									<button
										on:click={openModal(
											user.firstNameDisplay,
											user.lastNameDisplay,
											user.email,
											user.id
										)}
										type="button"
										class="btn btn-primary">Send Payment</button
									>
								{:else}
									<button type="button" class="btn btn-primary" disabled>Mark as paid</button>
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
						{#if user.paymentStatus == 'Unpaid'}
							<button
								on:click={() => {
									showPopUpForMarkAsPaid = true;
									userInfo = user;
								}}
								type="button"
								class="btn btn-primary">Mark as Paid</button
							>
							<button
								on:click={openModal(
									user.firstNameDisplay,
									user.lastNameDisplay,
									user.email,
									user.id
								)}
								type="button"
								class="btn btn-primary">Send Payment</button
							>
						{:else}
							<button type="button" class="btn btn-primary" disabled>Mark as Paid</button>
							<button type="button" class="btn btn-primary" disabled>Send Payment</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Pop-up for confirmation of mark as paid -->
{#if showPopUpForMarkAsPaid}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
	>
		<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
		<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
			<div class="p-6">
				<h2 class="text-lg font-medium">Are you sure you want to mark this as paid?</h2>
			</div>
			<p class="mt-6 mx-3 text-sm text-gray-500">Enter payment fee (in Philippine peso)</p>
			<input
				type="number"
				placeholder="Enter amount"
				bind:value={markFee}
				class="mt-6 mx-3 input input-bordered w-full max-w-xs"
			/>
			<div class="flex justify-end px-6 gap-2 py-4">
				<button class="btn btn-primary" on:click={markAsPaid}>Yes</button>
				<button class="btn btn-error text-white" on:click={() => (showPopUpForMarkAsPaid = false)}
					>No</button
				>
			</div>
		</div>
	</div>
{/if}
