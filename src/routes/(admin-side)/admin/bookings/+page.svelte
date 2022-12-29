<script>
	import {
		onSnapshot,
		query,
		collection,
		updateDoc,
		doc,
		orderBy,
		where
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { sendEmail } from '$lib/utils';

	let listOfBooking = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingsQuery = query(collection(db, 'booking'));

	async function getBookings(bookingsQuery) {
		const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
			listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		bookingsQuery = query(collection(db, 'booking'), orderBy(sortByField, 'asc'));
	}

	async function searchBookings() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValue),
			where(searchByField, '<=', searchByValue + '~')
		);
	}

	$: getBookings(bookingsQuery);

	async function approveBook(bookingId) {
		try {
			const bookref = doc(db, 'booking', bookingId);
			const data = {
				status: 'approved'
			};
			await updateDoc(bookref, data);
			alert('Booking request has been approved');
		} catch (error) {
			console.log(error);
			alert('Error approving request');
		}
	}

	async function disapproveBook(bookingId) {
		try {
			const bookref = doc(db, 'booking', bookingId);
			const data = {
				status: 'disapproved'
			};
			await updateDoc(bookref, data);
			alert('Booking request has been disapproved');
		} catch (error) {
			console.log(error);
			alert('Error disapproving request');
		}
	}

	async function sendPaymentEmail(bookEmail) {
		// console.log(bookEmail);
		try {
			const result = await sendEmail({
				to: bookEmail,
				subject: 'Southview Homes 3 Payment Method',
				html: '<h1>This is the link for payment for reservation in booking</ht>'
			});
			console.log(JSON.stringify(result));
			alert('Email for payment method sent successfully');
		} catch (error) {
			console.log(error);
			alert('Error in sending payment method');
		}
	}
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<div class="flex justify-between">
		<h1 class="text-3xl font-semibold py-12">Booking</h1>
		<a href="/admin/bookings/bookingsHistory" class="hover:underline">Go to History</a>
	</div>
	<div class="flex justify-between">
		<form on:submit|preventDefault={searchBookings}>
			<select bind:value={searchByField} required>
				<option value="" disabled selected>Search Filter</option>
				<option value="firstname">Name</option>
				<option value="email">E-mail Address</option>
				<option value="eventType">Type of Event</option>
				<option value="bookDate">Date and Time</option>
			</select>
			<input type="search" placeholder="Search here" required bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy}>
			<option value="" disabled selected>Sort By</option>
			<option value="firstname">Name</option>
			<option value="email">E-mail Address</option>
			<option value="eventType">Type of Event</option>
			<option value="bookDate">Date and Time</option>
		</select>
	</div>

	<!-- Medium to large screen -->
	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block">
		<table class="border-2 border-black bg-white w-full text-center">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="p-3 text-sm tracking-wide">Name</th>
					<th class="p-3 text-sm tracking-wide">E-mail Address</th>
					<th class="p-3 text-sm tracking-wide">Contact No.</th>
					<th class="p-3 text-sm tracking-wide">Type of Event</th>
					<th class="p-3 text-sm tracking-wide">Date and Time</th>
					<th class="p-3 text-sm tracking-wide" colspan="3" />
				</tr>
			</thead>
			<tbody>
				{#each listOfBooking as book}
					{#if book.status == 'pending'}
						<tr class="border-t-2 border-black">
							<td class="p-3 text-sm whitespace-nowrap">{book.firstname + ' ' + book.lastname}</td>
							<td class="p-3 text-sm whitespace-nowrap">{book.email}</td>
							<td class="p-3 text-sm whitespace-nowrap">{book.contactNumber}</td>
							<td class="p-3 text-sm whitespace-nowrap">{book.eventType}</td>
							<td class="p-3 text-sm whitespace-nowrap"
								>{book.bookDate.toDate().toLocaleDateString() +
									' at ' +
									book.bookDate.toDate().toLocaleTimeString()}</td
							>
							<td class="p-3 text-sm whitespace-nowrap">
								<button
									on:click={approveBook(book.id)}
									type="button"
									class="py-2 px-2 text-green-500 font-bold">Approve</button
								>
							</td>
							<td class="p-3 text-sm whitespace-nowrap">
								<button
									on:click={disapproveBook(book.id)}
									type="button"
									class="py-2 px-2 text-red-500 font-bold">Dissaprove</button
								>
							</td>
							<td class="p-3 text-sm whitespace-nowrap">
								<button
									on:click={sendPaymentEmail(book.email)}
									type="button"
									class="py-2 px-2 text-blue-500 font-bold hover:underline">Send Payment</button
								>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Small screen -->
	<div class="bg-gray-300 my-5 p-5  selection:grid grid-cols-1 gap-4 md:hidden rounded-lg shadow">
		{#each listOfBooking as book}
			{#if book.status == 'pending'}
				<div class="bg-white space-y-3 p-4 border-2 border-black">
					<div class="flex items-center space-x-2  text-sm">
						<div>
							<span class="font-bold text-sm">Name: </span>
							{book.firstname + ' ' + book.lastname}
						</div>
					</div>
					<div>
						<span class="font-bold text-sm">E-mail Address: </span>
						{book.email}
					</div>
					<div>
						<span class="font-bold text-sm">Contact No: </span>
						{book.contactNumber}
					</div>
					<div>
						<span class="font-bold text-sm">Type of Event: </span>
						{book.eventType}
					</div>
					<div>
						<span class="font-bold text-sm">Date and Time </span>
						{book.bookDate.toDate().toLocaleDateString() +
							' at ' +
							book.bookDate.toDate().toLocaleTimeString()}
					</div>
					<div>
						<button
							on:click={approveBook(book.id)}
							type="button"
							class="py-2 px-2 text-green-500 font-bold">Approve</button
						>
						<button
							on:click={disapproveBook(book.id)}
							type="button"
							class="py-2 px-2 text-red-500 font-bold">Dissaprove</button
						>
						<button
							on:click={sendPaymentEmail(book.email)}
							type="button"
							class="py-2 px-2 text-blue-500 font-bold hover:underline">Send Payment</button
						>
					</div>
				</div>
				<br />
			{/if}
		{/each}
	</div>
</div>
