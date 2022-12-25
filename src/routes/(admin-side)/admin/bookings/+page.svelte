<script>
	import { onSnapshot, query, collection, snapshotEqual, updateDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { sendEmail } from '$lib/utils';

	let listOfBooking = [];

	const bookingQuery = query(collection(db, 'booking'));
	const unsubscribe = onSnapshot(bookingQuery, (querySnapshot) => {
		listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());

	async function approveBook(bookingId) {
		try {
			const bookref = doc(db, 'booking', bookingId);
			const data = {
				status: 'Approved'
			};
			await updateDoc(bookref, data);
			alert('Booking has been Approved');
		} catch (error) {
			console.log(error);
			alert('Error Approving Book');
		}
	}

	async function disapproveBook(bookingId) {
		try {
			const bookref = doc(db, 'booking', bookingId);
			const data = {
				status: 'Disapproved'
			};
			await updateDoc(bookref, data);
			alert('Booking has been Disapproved');
		} catch (error) {
			console.log(error);
			alert('Error Disapproving Book');
		}
	}

	async function sendPaymentEmail(bookEmail) {
		// console.log(bookEmail);
		try {
			const result = await sendEmail({
				to: bookEmail,
				subject: 'Southview Homes 3 Payment Method',
				html: '<h1>This is a the link for payment for reservation in booking</ht>'
			});
			console.log(JSON.stringify(result));
			alert('Email for payment method sent successfuly');
		} catch (error) {
			console.log(error);
			alert('Error in sending payment method');
		}
	}
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Booking</h1>
	<a href="/admin/bookings/approvedbookings">Go to Approved Books</a>
	<br />
	<a href="/admin/bookings/disapprovedbookings">Go to Disapproved Books</a>
	<div class="py-5">
		<table class="border-2 border-black bg-white w-full">
			<thead>
				<tr class="font-bold bg-gray-500">
					<th class="text-left">Name</th>
					<th class="text-left">Email Address</th>
					<th class="text-left">Contact No.</th>
					<th class="text-left">Type of Event</th>
					<th class="text-left">Date</th>
					<th class="text-left">Time</th>
				</tr>
			</thead>
			<tbody>
				{#each listOfBooking as book}
					{#if book.status == 'Pending'}
						<tr tr class="border-t-2 border-black">
							<td class="text-left">{book.firstName} {book.lastName}</td>
							<td class="text-left">{book.email}</td>
							<td class="text-left">{book.contactNumber}</td>
							<td class="text-left">{book.eventType}</td>
							<td class="text-left">{book.date}</td>
							<td class="text-left">{book.time}</td>
							<button
								on:click={approveBook(book.id)}
								type="button"
								class="py-2 px-10 text-green-500">Approve</button
							>
							<button
								on:click={disapproveBook(book.id)}
								type="button"
								class="py-2 px-10 text-red-500">Dissaprove</button
							>
							<button
								on:click={sendPaymentEmail(book.email)}
								type="button"
								class="py-2 px-10 text-blue-500">Send Payment Method to Email</button
							>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
