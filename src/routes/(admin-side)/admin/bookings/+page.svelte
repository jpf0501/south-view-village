<script>
	import {
		onSnapshot,
		query,
		collection,
		updateDoc,
		doc,
		where,
		orderBy,
		serverTimestamp,
		getCountFromServer
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { createPaymentLink, sendEmail } from '$lib/utils';

	let listOfBooking = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingStatus = '';
	let bookingPaymentStatus = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', '==', 'Pending'),
		orderBy('dateReserved', 'desc')
	);
	let countofSearchResult = '';
	let noResult = false;

	let currentPage = 1;
	let pageSize = 10;
	let totalRecords = 1;
	let totalPages = 0;

	async function getBookings(bookingsQuery, page, pageSize) {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
			listOfBooking = querySnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.slice(startIndex, endIndex);
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		if (sortByField == 'bookDate') {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', '==', 'Pending'),
				orderBy(sortByField, 'desc')
			);
		} else {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', '==', 'Pending'),
				orderBy(sortByField, 'asc')
			);
		}
	}

	async function searchBookings() {
		let searchByValueCase = searchByValue.toLowerCase();
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			where('status', '==', 'Pending')
		);

		const snapshotOfCountOfPendingBookings = await getCountFromServer(bookingsQuery);
		countofSearchResult = snapshotOfCountOfPendingBookings.data().count;
		countofSearchResult === 0 ? (noResult = true) : (noResult = false);
	}

	async function changeStatus(bookingId) {
		try {
			const bookRef = doc(db, 'booking', bookingId);
			const data = {
				status: bookingStatus,
				dateReviewed: serverTimestamp()
			};
			await updateDoc(bookRef, data);
			alert('Booking request has been ' + bookingStatus);
		} catch (error) {
			console.log(error);
		}
	}
	async function changePaymentStatus(bookingId) {
		try {
			const bookRef = doc(db, 'booking', bookingId);
			const data = {
				paymentStatus: bookingPaymentStatus
			};
			await updateDoc(bookRef, data);
		} catch (error) {
			console.log(error);
		}
	}

	async function sendPaymentEmail(bookEmail, bookID) {
		// console.log(bookID)
		try {
			const paymentLinkData = await createPaymentLink(
				'Clubhouse Reservation Downpayment',
				50000,
				bookID
			);
			const checkoutURL = paymentLinkData.data.attributes.checkout_url;
			const result = await sendEmail({
				to: bookEmail,
				subject: 'Southview Homes 3 Payment Method',
				html: `<h1>This is the link for payment for reservation in booking: <a href=${checkoutURL}>Click here</a></h1>`
			});
			console.log(JSON.stringify(result));
			alert('Email for payment method sent successfully');
		} catch (error) {
			console.log(error);
			alert('Error in sending payment method');
		}
	}
	async function resetButton() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Pending'),
			orderBy('dateReserved', 'desc')
		);
		searchByValue = '';
	}
	$: {
		getBookings(bookingsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
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
	<title>Booking Requests - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<div class="flex justify-between py-10">
		<h1 class="text-3xl font-semibold">Booking</h1>
		<a href="/admin/bookings/bookingsHistory" class="btn btn-primary">View History</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form on:submit|preventDefault={searchBookings} class="my-4">
				<select bind:value={searchByField} class="select select-bordered" required>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstname">Name</option>
					<option value="email">E-mail Address</option>
					<option value="eventType">Type of Event</option>
					<!-- <option value="bookDate">Date and Time</option> -->
				</select>
				<input
					type="search"
					placeholder="Search here"
					class="input input-bordered mx-2"
					bind:value={searchByValue}
				/>
			</form>
			<button on:click={resetButton} class="btn btn-primary my-4">Reset</button>
		</div>

		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="firstname">Name</option>
			<option value="email">E-mail Address</option>
			<option value="eventType">Type of Event</option>
			<option value="bookDate">Date and Time</option>
		</select>
	</div>

	<style>
		table {
			counter-reset: section;
		}
		.count:before {
			counter-increment: section;
			content: counter(section);
		}
	</style>

	<!-- Medium to large screen -->
	<div
		class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block"
	>
		<div class="overflow-x-auto">
			<table class="table w-full ">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact Number</th>
						<th class="text-lg">Type of Event</th>
						<th class="text-lg">Date and Time</th>
						<!-- <th class="text-lg">Date Reserved</th> -->
						<th class="text-lg">Payment Status</th>
						<th colspan="2" />
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="" colspan="8">No result found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfBooking as book}
						<!-- {#if book.status == 'Pending'} -->
						<tr class="hover">
							<td class="count" />
							<td>{book.firstNameDisplay + ' ' + book.lastNameDisplay}</td>
							<td>{book.email}</td>
							<td>{book.contactNumber}</td>
							<td>{book.eventTypeDisplay}</td>
							<td
								>{book.bookDate.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) +
									' at ' +
									book.bookDate
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							>
							<!-- <td
									>{book.dateReserved.toDate().toLocaleDateString('en-us', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									}) +
										' at ' +
										book.dateReserved
											.toDate()
											.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
								> -->
							<td class="text-center"
								><form on:submit|preventDefault={changePaymentStatus(book.id)}>
									{#if book.paymentStatus == 'Paid'}
										<button type="submit" on:click={() => (bookingPaymentStatus = 'Unpaid')}>
											<span class="p-3 text-sm whitespace-nowrap text-green-500 font-bold">
												{book.paymentStatus}
											</span>
										</button>
									{:else if book.paymentStatus == 'Unpaid'}
										<button type="submit" on:click={() => (bookingPaymentStatus = 'Paid')}>
											<span class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">
												{book.paymentStatus}
											</span>
										</button>
									{/if}
								</form></td
							>
							<td
								><form on:submit|preventDefault={changeStatus(book.id, book.paymentStatus)}>
									{#if book.paymentStatus == 'Unpaid'}
										<button
											on:click={() => (bookingStatus = 'Approved')}
											type="submit"
											class="btn btn-success text-white"
											disabled>Approve</button
										>
									{:else}
										<button
											on:click={() => (bookingStatus = 'Approved')}
											type="submit"
											class="btn btn-success text-white">Approve</button
										>
									{/if}
									{#if book.paymentStatus == 'Paid'}
										<button
											on:click={() => (bookingStatus = 'Disapproved')}
											type="submit"
											class="btn btn-error text-white"
											disabled>Dissaprove</button
										>
									{:else}
										<button
											on:click={() => (bookingStatus = 'Disapproved')}
											type="submit"
											class="btn btn-error text-white">Dissaprove</button
										>
									{/if}
								</form></td
							>
							<td>
								{#if book.paymentStatus == 'Unpaid'}
									<button
										on:click={sendPaymentEmail(book.email, book.id)}
										type="button"
										class="btn btn-primary">Send Payment</button
									>
								{:else}
									<button type="button" class="btn btn-primary" disabled>Send Payment</button>
								{/if}
							</td>
						</tr>
						<!-- {/if} -->
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#if noResult}
			<div class="w-full mx-auto" colspan="8">No result found</div>
		{/if}
		{#each listOfBooking as book}
			<!-- {#if book.status == 'Pending'} -->
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{book.firstNameDisplay + ' ' + book.lastNameDisplay}</h2>
					<div>
						<span class="my-1 font-bold">E-mail Address:</span>
						{book.email}
					</div>
					<div>
						<span class="my-1 font-bold">Contact No:</span>
						{book.contactNumber}
					</div>
					<div>
						<span class="my-1 font-bold">Type of Event:</span>
						{book.contactNumber}
					</div>
					<div>
						<span class="my-1 font-bold">Date and Time:</span>
						{book.bookDate
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							book.bookDate
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
					</div>
					<!-- <div>
							<span class="my-1 font-bold">Date Reserved:</span>
							{book.dateReserved
								.toDate()
								.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
								' at ' +
								book.dateReserved
									.toDate()
									.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
						</div> -->
					<div class="flex flex-row">
						<span class="my-1 font-bold">Status:</span>
						<form on:submit|preventDefault={changePaymentStatus(book.id)}>
							{#if book.paymentStatus == 'Paid'}
								<button type="submit" on:click={() => (bookingPaymentStatus = 'Unpaid')}>
									<span class="p-3 text-sm whitespace-nowrap text-green-500 font-bold">
										{book.paymentStatus}
									</span>
								</button>
							{:else if book.paymentStatus == 'Unpaid'}
								<button type="submit" on:click={() => (bookingPaymentStatus = 'Paid')}>
									<span class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">
										{book.paymentStatus}
									</span>
								</button>
							{/if}
						</form>
					</div>
					<div>
						<form on:submit|preventDefault={changeStatus(book.id, book.paymentStatus)} class="py-3">
							{#if book.paymentStatus == 'Unpaid'}
								<button
									on:click={() => (bookingStatus = 'Approved')}
									type="submit"
									class="btn btn-success text-white"
									disabled>Approve</button
								>
							{:else}
								<button
									on:click={() => (bookingStatus = 'Approved')}
									type="submit"
									class="btn btn-success text-white">Approve</button
								>
							{/if}
							{#if book.paymentStatus == 'Paid'}
								<button
									on:click={() => (bookingStatus = 'Disapproved')}
									type="submit"
									class="btn btn-error text-white"
									disabled>Dissaprove</button
								>
							{:else}
								<button
									on:click={() => (bookingStatus = 'Disapproved')}
									type="submit"
									class="btn btn-error text-white">Dissaprove</button
								>
							{/if}
						</form>
						<button
							on:click={sendPaymentEmail(book.email, book.id)}
							type="button"
							class="btn btn-primary">Send Payment</button
						>
					</div>
				</div>
			</div>
			<!-- {/if} -->
		{/each}
	</div>
</div>

<!-- pagination button -->
<div class="flex justify-center items-center mt-5">
	<nav class="block">
		<ul class="flex pl-0 rounded list-none flex-wrap">
			{#if currentPage > 1}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage - 1)}
					>
						Previous
					</button>
				</li>
			{/if}

			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				{#if page === currentPage}
					<li>
						<button
							class="relative block py-2 px-3 leading-tight bg-blue-700 text-white hover:bg-blue-500 focus:bg-blue-500"
							>{page}</button
						>
					</li>
				{:else if (page >= currentPage - 2 && page <= currentPage + 2) || page === totalPages || page === 1}
					<li>
						<button
							class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
							on:click={() => goToPage(page)}
						>
							{page}
						</button>
					</li>
				{:else if page === currentPage - 3 || page === currentPage + 3}
					<li>
						<span
							class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700"
							>...</span
						>
					</li>
				{/if}
			{/each}

			{#if currentPage < totalPages}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage + 1)}
					>
						Next
					</button>
				</li>
			{/if}
		</ul>
	</nav>
</div>

<!-- mema comment -->
