<script>
	import {
		onSnapshot,
		query,
		collection,
		updateDoc,
		doc,
		where,
		orderBy,
		serverTimestamp
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { createPaymentLink, sendEmail } from '$lib/utils';
	import Pagination from '../Pagination.svelte';
	import toast from 'svelte-french-toast';

	let listOfBooking = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingStatus = '';
	let bookingPaymentStatus = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', '==', 'Pending'),
		orderBy('dateReserved', 'asc')
	);

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
				orderBy(sortByField, 'desc'),
				orderBy('dateReserved', 'asc')
			);
		} else {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', '==', 'Pending'),
				orderBy(sortByField, 'asc'),
				orderBy('dateReserved', 'asc')
			);
		}
	}

	async function searchBookings() {
		let searchByValueCase = searchByValue.toLowerCase();
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValueCase),
			orderBy(searchByField, 'asc'),
			where(searchByField, '<=', searchByValueCase + '~'),
			where('status', '==', 'Pending'),
			orderBy('dateReserved', 'asc')
		);
	}

	async function changeStatus(bookingId, bookEmail, bookDate) {
		try {
			const bookRef = doc(db, 'booking', bookingId);
			const data = {
				status: bookingStatus,
				dateReviewed: serverTimestamp()
			};
			await updateDoc(bookRef, data);
			toast.success('Booking request has been ' + bookingStatus.toLowerCase() + ' !');
			try {
				const result = await sendEmail({
					to: bookEmail,
					subject: 'Southview Homes 3 Booking Request',
					html:
						'<h1>Your booking request that is scheduled on ' +
						bookDate.toDate().toLocaleDateString('en-us', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						}) +
						' at ' +
						bookDate.toDate().toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }) +
						' has been ' +
						bookingStatus.toLowerCase() +
						' by the admin</ht>'
				});
				// console.log(JSON.stringify(result));
				// alert('Email sent successfuly');
			} catch (error) {
				console.log(error);
				toast.error('Error in sending update of booking request in email');
			}
		} catch (error) {
			console.log(error);
			toast.error('Error in updating a booking!');
		}
	}
	async function changePaymentStatus(bookingId) {
		try {
			const bookRef = doc(db, 'booking', bookingId);
			const data = {
				paymentStatus: bookingPaymentStatus
			};
			await updateDoc(bookRef, data);
			toast.success('Booking status changed!');
		} catch (error) {
			console.log(error);
			toast.error('Error in changing booking status!');
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
			toast.success('Payment has been sent!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending payment!');
		}
	}
	async function resetButton() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Pending'),
			orderBy('dateReserved', 'asc')
		);
		searchByValue = '';
	}
	$: {
		getBookings(bookingsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
			totalRecords = querySnapshot.docs.length;
			totalPages = Math.ceil(totalRecords / pageSize);
		});
		listOfBooking.length === 0 ? (noResult = true) : (noResult = false);
		onDestroy(() => unsubscribe());
	}
	function goToPage(page) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Booking Requests - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Bookings</h1>
	<div class="flex justify-end">
		<a href="/admin/bookings/history" class="btn btn-primary ">View History</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchBookings}
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
					<option value="email">E-mail Address</option>
					<option value="eventType">Type of Event</option>
					<!-- <option value="bookDate">Date and Time</option> -->
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
			<option value="email">E-mail Address</option>
			<option value="eventType">Type of Event</option>
			<option value="bookDate">Date and Time</option>
		</select>
		<a class="btn btn-primary my-4" href="/admin/bookings/create">Add a Booking</a>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
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
						<td class="py-24 text-center" colspan="8">No Pending Booking/s Found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfBooking as book, i}
						<!-- {#if book.status == 'Pending'} -->
						<tr class="hover">
							<td>{i + (currentPage - 1) * pageSize + 1}</td>
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
								><form on:submit|preventDefault={changeStatus(book.id, book.email, book.bookDate)}>
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
									<button
										on:click={() => (bookingStatus = 'Cancelled')}
										type="submit"
										class="btn btn-warning text-white">Cancel</button
									>
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
			<div class="w-full mx-auto">No Pending Booking/s Found</div>
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
						<form
							on:submit|preventDefault={changeStatus(book.id, book.email, book.bookDate)}
							class="py-3"
						>
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
							<button
									on:click={() => (bookingStatus = 'Cancelled')}
									type="submit"
									class="btn btn-error text-white">Dissaprove</button
								>
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

	<div class="mt-14">
		<Pagination {currentPage} {totalPages} onPageChange={goToPage} />
	</div>
</div>
