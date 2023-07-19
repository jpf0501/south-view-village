<script>
	import {
		onSnapshot,
		query,
		collection,
		updateDoc,
		doc,
		where,
		getDoc,
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
	let bookingDetail = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', 'in', ['Pending', 'Approved']),
		orderBy('dateReserved', 'asc')
	);

	let unsubscribe = () => {};

	let showPopUp, bookingDetailPopup, reservationPopup = false;
	let bookingDetailId, markID, rebookDate, rebookStartTime, rebookEndTime, bookingForScheduleId = '';
	let data = {};

	async function changeSortBy() {
		const order = sortByField === 'bookDate' ? 'desc' : 'asc';
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Pending', 'Approved']),
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
			where('status', 'in', ['Pending', 'Approved']),
			orderBy('dateReserved', 'asc')
		);
	}

	async function bookStatFunc(id, firstname, lastname, email, bookDate, event, bookStatus) {
		const bookRef = doc(db, 'booking', id);
		try {
			data = {
				status: bookStatus,
				dateReviewed: serverTimestamp()
			};
			await updateDoc(bookRef, data);
			toast.success('Booking request has been ' + bookStatus.toLowerCase() + ' !');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating a booking!');
		}
		//sendUpdateToEmail(id, firstname, lastname, email, bookDate, event);
		bookingDetailPopup = false;
	}

	async function sendUpdateToEmail(id, firstname, lastname, email, bookDate, event) {
		let message;

		if (bookingStatus === 'Approved') {
			message = `
            <p>We are pleased to confirm your booking and look forward to welcoming you on the date of reservation. If you have any further questions or concerns regarding this decision, please do not hesitate to contact us.</p>
        `;
		} else if (bookingStatus === 'Disapproved') {
			message = `
            <p>Unfortunately, we are unable to approve your booking request at this time. We apologize for any inconvenience this may have caused and encourage you to consider alternative dates or services. If you have any further questions or concerns regarding this decision, please do not hesitate to contact us.</p>
        `;
		}
		
		const date = bookDate.toDate().toLocaleDateString('en-us', {year: 'numeric', month: 'long', day: 'numeric'})
		const time = bookDate.toDate().toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })

		try {
			await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Reservation Status Update',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p><br/>Hello ${firstname} ${lastname},</p>
				<p>We are writing to inform you that your booking request has been <strong>${bookingStatus.toLocaleUpperCase()}</strong>. As a reminder, the details of your booking are as follows:</p>
				<ul>
					<li><strong>Type of Reservation:</strong> ${event}</li>
					<li><strong>Date Scheduled:</strong> ${date}</li>
					<li><strong>Time Scheduled:</strong> ${time}</li>
				</ul>
				<p>${message}</p>
				<p>We hope to have the opportunity to serve you again in the future.</p>
				<p>For other inquiries, feel free give us a call at 8330-4163 / 09063955407. You can also file for an inquiry at our <a href="https://ssv.vercel.app">website</a> or send us an email at <a href="mailto:southviewhomes3mail@gmail.com">southviewhomes3mail@gmail.com</a>.</p>
				<p><br/>Best regards,<br/>Southview Homes 3 Home Owners Association</p>
				`
			});
		} catch (error) {
			console.log(error);
			toast.error('Error in sending update of booking request in email');
		}
	}

	async function sendPaymentEmail(email, id, firstname, lastname, date, event) {
		try {
			const paymentLinkData = await createPaymentLink(
				'Clubhouse Reservation Downpayment',
				50000,
				id
			);
			const checkoutURL = paymentLinkData.data.attributes.checkout_url;
			const result = await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Reservation Payment Form',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				<p style="font-size:13px; text-decoration:underline">This is an automated message. Do not reply.</p></center>
				<p><br/>Hello ${firstname} ${lastname},</p>
				<p>Thank you for making a reservation with us. We are delighted to have your interest in filing a reservation for our subdivision's clubhouse. As a reminder, your reservation for ${event} is scheduled for ${date.toDate().toLocaleDateString('en-us', {year: 'numeric', month: 'long', day: 'numeric'})} at ${date.toDate().toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}.</p>
				<p>To secure your reservation, we kindly request that you complete the payment process by clicking on the payment link below. The payment link will direct you to a payment form where you can enter your payment details and complete the transaction. Please note that your reservation is not confirmed until payment is received.</p>
				<p>You can access the payment form <a href=${checkoutURL}>here</a>.</p>
				<p>For other inquiries, feel free give us a call at 8330-4163 / 09063955407. You can also file for an inquiry at our <a href="https://ssv.vercel.app">website</a> or send us an email at <a href="mailto:southviewhomes3mail@gmail.com">southviewhomes3mail@gmail.com</a>.</p>
				<p><br/>Best regards,<br/>Southview Homes 3 Home Owners Association</p>
				`
			});
			// console.log(JSON.stringify(result));
			toast.success('Payment has been sent!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending payment!');
		}
	}

	async function openBooking(id) {
		const snapshot = await getDoc(doc(db, 'booking', id));
		bookingDetailId = snapshot.id;
		bookingDetail = snapshot.data();
		bookingDetailPopup = true;
		//console.log(bookingDetailId, bookingDetail.lastNameDisplay)
	}

	function closeBooking() {
		bookingDetailPopup = false;
	}

	function openRebooking(id) {
		bookingForScheduleId = id;
		reservationPopup = true;
	}

	function closeRebooking() {
		reservationPopup = false;
	}

	async function markAsPaid(id) {
		try {
			const bookRef = doc(db, 'booking', id);
			const data = {
				paymentStatus: 'Paid'
			};
			bookingDetailPopup = false;
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

	async function rescheduleBooking(id) {
		// console.log(id, rebookDate, rebookStartTime, rebookEndTime)
		console.log(new Date(rebookDate + ' ' + rebookStartTime))
		try {
			const bookRef = doc(db, 'booking', id);
			const data = {
				bookDate: new Date(rebookDate + ' ' + rebookStartTime),
				endTime: rebookEndTime,
			};
			bookingDetailPopup = false;
			showPopUp = false;
			await updateDoc(bookRef, data);
			toast.success('Successfully rescheduled event!');
			reservationPopup = false;
			bookingDetailPopup = false;
		} catch (error) {
			console.log(error);
			toast.error('Error in rescheduling event!');
			reservationPopup = false;
			bookingDetailPopup = false;
		}
	}

	onDestroy(() => unsubscribe());
	$: setUpRealtimeListener(bookingsQuery);
</script>

<svelte:head>
	<title>Booking Requests - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if bookingDetailPopup}
<div
class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
>
<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
	<div class="p-6">
		<h2 class="text-lg font-medium">Reservation Details</h2>
		<div class="divider"></div>
		<p class="mt-6 text-sm">NAME     |     {bookingDetail.firstNameDisplay + ' ' + bookingDetail.lastNameDisplay}</p>
		<p class="mt-6 text-sm">EMAIL ADDRESS     |     {bookingDetail.email}</p>
		<p class="mt-6 text-sm">CONTACT NO.    |     {bookingDetail.contactNumber}</p>
		<p class="mt-6 text-sm">DATE OF RESERVATION   |     {bookingDetail.dateReserved.toDate().toLocaleDateString('en-us', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'})}</p>
		<p class="mt-6 text-sm">DATE REVIEWED     |     {bookingDetail.dateReviewed ? bookingDetail.dateReviewed.toDate().toLocaleDateString('en-us', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'}) : "FOR REVIEW"}</p>
		<p class="mt-6 text-sm">PAYMENT STATUS     |     {bookingDetail.paymentStatus}</p>
		<p class="mt-6 text-sm">BOOKING STATUS     |     {bookingDetail.status}</p>
	</div>
	<div class="flex flex-col px-6 gap-2 py-4">
		{#if bookingDetail.status == 'Pending'}
		<button class="btn btn-success text-white"
			on:click={bookStatFunc(bookingDetailId,
				bookingDetail.firstNameDisplay,
				bookingDetail.lastNameDisplay,
				bookingDetail.email,
				bookingDetail.bookDate,
				bookingDetail.eventTypeDisplay, 
				'Approved')}
			>Approve</button
		>
		<button class="btn btn-error text-white" on:click={bookStatFunc(bookingDetailId,
			bookingDetail.firstNameDisplay,
			bookingDetail.lastNameDisplay,
			bookingDetail.email,
			bookingDetail.bookDate,
			bookingDetail.eventTypeDisplay, 
			'Disapproved')}
			>Disapprove</button
		>
			{#if bookingDetail.paymentStatus == "Unpaid"}
				<button class="btn btn-accent text-white" on:click={markAsPaid(bookingDetailId)}
				>Mark as Paid</button
				>
			{/if}
		{/if}
		{#if bookingDetail.status == 'Approved'}
		<button class="btn btn-success text-white" on:click={bookStatFunc(bookingDetailId,
			bookingDetail.firstNameDisplay,
			bookingDetail.lastNameDisplay,
			bookingDetail.email,
			bookingDetail.bookDate,
			bookingDetail.eventTypeDisplay, 
			'Completed')}
			>Mark as Completed</button
		>
		<button class="btn btn-error text-white" on:click={openRebooking(bookingDetailId)}
			>Reschedule Event</button
		>
		<button class="btn btn-accent text-white" on:click={bookStatFunc(bookingDetailId,
			bookingDetail.firstNameDisplay,
			bookingDetail.lastNameDisplay,
			bookingDetail.email,
			bookingDetail.bookDate,
			bookingDetail.eventTypeDisplay, 
			'Cancelled')}
			>Cancel Booking</button
		>
		{/if}
		<button class="btn btn-primary text-white" on:click={closeBooking}>Close</button>
	</div>
</div>
</div>
{/if}

{#if reservationPopup}
<div
class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
>
<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
	<div class="p-6">
		<h2 class="text-lg font-medium">Reschedule Reservation</h2>
		<p class="mt-6 text-sm text-gray-500">Enter new date of event</p>
		<input
			type="date"
			bind:value={rebookDate}
			class="mt-6 input input-bordered w-full max-w-xs"
		/>
		<!-- <p>{bookingForScheduleId}</p> -->
		<p class="mt-6 text-sm text-gray-500">Enter new starting time of event</p>
		<input
			type="time"
			min="8:00"
			max="19:00"
			bind:value={rebookStartTime}
			class="mt-6 input input-bordered w-full max-w-xs"
		/>
		<p class="mt-6 text-sm text-gray-500">Enter new ending time of event</p>
		<input
			type="time"
			min="8:00"
			max="19:00"
			bind:value={rebookEndTime}
			class="mt-6 input input-bordered w-full max-w-xs"
		/>
	</div>
	<div class="flex justify-end px-6 gap-2 py-4">
		<button class="btn btn-primary" on:click={rescheduleBooking(bookingForScheduleId)}
			>Reschedule Booking</button
		>
		<button class="btn btn-error text-white" on:click={closeRebooking}>Cancel</button>
	</div>
</div>
</div>
{/if}

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
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact Number</th>
						<th class="text-lg">Type of Event</th>
						<th class="text-lg">Date</th>
						<th class="text-lg">Status</th>
						<!-- <th class="text-lg">Date Reserved</th> -->
						<th class="text-lg">Payment Status</th>
						<th></th>
						<th></th>
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
							<td>{book.paymentStatus}</td>
							<!-- <td
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
							> -->
							<td><button type="button" class="btn btn-primary" on:click={openBooking(book.id)}>View Details</button></td>
							<td>
								{#if book.paymentStatus === 'Unpaid'}
									<!-- <button
										on:click={() => ([showPopUp, markID] = [true, book.id])}
										type="button"
										class="btn btn-primary">Mark as Paid</button
									> -->
									<button
										on:click={sendPaymentEmail(book.email, book.id, book.firstNameDisplay, book.lastNameDisplay, book.bookDate, book.eventTypeDisplay)}
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
						{#if book.paymentStatus === 'Unpaid'}
							<button
								on:click={() => ([showPopUp, markID] = [true, book.id])}
								type="button"
								class="btn btn-primary">Mark as Paid</button
							>
							<button
								on:click={sendPaymentEmail(book.email, book.id, book.firstNameDisplay, book.lastNameDisplay)}
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
