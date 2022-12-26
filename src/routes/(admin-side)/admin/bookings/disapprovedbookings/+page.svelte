<script>
	import { onSnapshot, query, collection, snapshotEqual, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfApprovedBooks = [];

	const approvedBooksQuery = query(collection(db, 'booking'), where('status', '==', 'Disapproved'));
	const unsubscribe = onSnapshot(approvedBooksQuery, (querySnapshot) => {
		listOfApprovedBooks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<h1 class="text-3xl font-semibold py-12">Approved Books</h1>
	<a href="/admin/bookings" class="">Go back to Bookings</a>
    <br>
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
					<th class="text-left">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each listOfApprovedBooks as approvedBooks}
					<tr tr class="border-t-2 border-black">
						<td class="text-left">{approvedBooks.firstName} {approvedBooks.lastName}</td>
						<td class="text-left">{approvedBooks.email}</td>
						<td class="text-left">{approvedBooks.contactNumber}</td>
						<td class="text-left">{approvedBooks.eventType}</td>
						<td class="text-left">{approvedBooks.date}</td>
						<td class="text-left">{approvedBooks.time}</td>
						<td class="text-left">{approvedBooks.status}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
