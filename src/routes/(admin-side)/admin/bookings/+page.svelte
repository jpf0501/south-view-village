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
	import toast from 'svelte-french-toast';

	let listOfBooking = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingStatus = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', '==', 'Pending'),
		orderBy('dateReserved', 'asc')
	);

	let unsubscribe = () => {};

	let showPopUp = false;
	let markID = '';

	async function changeSortBy() {
		const order = sortByField === 'bookDate' ? 'desc' : 'asc';
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Pending'),
			orderBy(sortByField, order),
			orderBy('dateReserved', 'asc')
		);
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

	async function approvalHandler(id, firstname, lastname, email, bookDate, event) {
		changeStatus(id);
		sendUpdateToEmail(id, firstname, lastname, email, bookDate, event);
	}

	async function changeStatus(id) {
		try {
			const bookRef = doc(db, 'booking', id);
			const data = {
				status: bookingStatus,
				dateReviewed: serverTimestamp()
			};
			await updateDoc(bookRef, data);
			toast.success('Booking request has been ' + bookingStatus.toLowerCase() + ' !');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating a booking!');
		}
	}

	async function sendUpdateToEmail(id, firstname, lastname, email, bookDate, event) {
		let message;

		if (bookingStatus === 'Approved') {
			message = `
            <p>We are pleased to confirm your booking and look forward to welcoming you. If you have any further questions or concerns, please do not hesitate to contact us.</p>
        `;
		} else if (bookingStatus === 'Disapproved') {
			message = `
            <p>Unfortunately, we are unable to approve your booking request at this time. We apologize for any inconvenience this may have caused and encourage you to consider alternative dates or services. If you have any further questions or concerns, please do not hesitate to contact us.</p>
        `;
		}
		let date = bookDate
			.toDate()
			.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' });
		let time = bookDate
			.toDate()
			.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' });
		try {
			await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Booking Status Update',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p>Booking Status Update</p>
				<p>Dear ${firstname} ${lastname},</p>
				<p>Thank you for your recent booking request.</p>
				<p>We are writing to inform you that your booking request has been <strong>${bookingStatus.toLocaleUpperCase()}</strong>. The details of your booking are as follows:</p>
				<ul>
					<li><strong>Booking ID:</strong> ${id}</li>
					<li><strong>Service/Event/Reservation:</strong> ${event}</li>
					<li><strong>Date:</strong> ${date}</li>
					<li><strong>Time:</strong> ${time}</li>
				</ul>
				<p>${message}</p>
				<p>Thank you for your interest in Soutvhiew Homes 3. We hope to have the opportunity to serve you in the future.</p>
				<p>Best regards,</p>
				<p>Soutview Homes 3</p>
				`
			});
		} catch (error) {
			console.log(error);
			toast.error('Error in sending update of booking request in email');
		}
	}

	async function sendPaymentEmail(email, id) {
		try {
			const paymentLinkData = await createPaymentLink(
				'Clubhouse Reservation Downpayment',
				50000,
				id
			);
			const checkoutURL = paymentLinkData.data.attributes.checkout_url;
			const result = await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Payment Method',
				html: `<h1>This is the link for payment for reservation in booking: <a href=${checkoutURL}>Click here</a></h1>`
			});
			// console.log(JSON.stringify(result));
			toast.success('Payment has been sent!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending payment!');
		}
	}

	async function markAsPaid(id) {
		try {
			const bookRef = doc(db, 'booking', id);
			const data = {
				paymentStatus: 'Paid'
			};
			showPopUp = false;
			await updateDoc(bookRef, data);
			toast.success('Booking mark as paid!');
		} catch (error) {
			console.log(error);
			toast.error('Error in marking book as paid!');
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

	function setUpRealtimeListener(bookingsQuery) {
		unsubscribe();
		unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
			listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
	}

	onDestroy(() => unsubscribe());
	$: setUpRealtimeListener(bookingsQuery);
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
					<!-- <option value="email">E-mail Address</option> -->
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
				<tbody>
					{#each listOfBooking as book, i}
						<tr class="hover">
							<td>{i + 1}</td>
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
							<td class="text-center">{book.paymentStatus}</td>
							<td
								><form
									on:submit|preventDefault={approvalHandler(
										book.id,
										book.firstNameDisplay,
										book.lastNameDisplay,
										book.email,
										book.bookDate,
										book.eventTypeDisplay
									)}
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
								</form></td
							>
							<td>
								{#if book.paymentStatus === 'Unpaid'}
									<button
										on:click={() => ([showPopUp, markID] = [true, book.id])}
										type="button"
										class="btn btn-primary">Mark as Paid</button
									>
									<button
										on:click={sendPaymentEmail(book.email, book.id)}
										type="button"
										class="btn btn-primary">Send Payment</button
									>
								{:else}
									<button type="button" class="btn btn-primary" disabled>Mark as Paid</button>
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
						{book.eventTypeDisplay}
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
					<div class="">
						<span class="my-1 font-bold">Status:</span>
						{book.paymentStatus}
					</div>
					<div>
						<form
							on:submit|preventDefault={approvalHandler(
								book.id,
								book.firstNameDisplay,
								book.lastNameDisplay,
								book.email,
								book.bookDate,
								book.eventTypeDisplay
							)}
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
						</form>
						{#if book.paymentStatus === 'Unpaid'}
							<button
								on:click={() => ([showPopUp, markID] = [true, book.id])}
								type="button"
								class="btn btn-primary">Mark as Paid</button
							>
							<button
								on:click={sendPaymentEmail(book.email, book.id)}
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
			<!-- {/if} -->
		{/each}
	</div>
</div>

<!-- Pop-up for confirmation of mark as paid -->
{#if showPopUp}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
	>
		<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
		<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
			<div class="p-6">
				<h2 class="text-lg font-medium">Are you sure you want to mark this as paid?</h2>
			</div>
			<div class="flex justify-end px-6 gap-2 py-4">
				<button class="btn btn-primary" on:click={markAsPaid(markID)}>Yes</button>
				<button class="btn btn-error text-white" on:click={() => (showPopUp = false)}>No</button>
			</div>
		</div>
	</div>
{/if}
