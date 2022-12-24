<script>
	import { onSnapshot, query, collection, snapshotEqual } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfBooking = [];

	const bookingQuery = query(collection(db, 'booking'));
	const unsubscribe = onSnapshot(bookingQuery, (querySnapshot) => {
		listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Booking</h1>
	<a href="/admin/bookings/approvedbookings">Go to Approved Books</a>
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
					<tr tr class="border-t-2 border-black">
						<td class="text-left">{book.firstName} {book.lastName}</td>
						<td class="text-left">{book.email}</td>
						<td class="text-left">{book.contactNumber}</td>
						<td class="text-left">{book.eventType}</td>
						<td class="text-left">{book.date}</td>
						<td class="text-left">{book.time}</td>
						<button type="button" class="py-2 px-10 text-green-500">Approve</button>
						<button type="button" class="py-2 px-10 text-red-500">Dissaprove</button>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
