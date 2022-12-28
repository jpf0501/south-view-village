<script>
	import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfBooking = [];

	const bookingQuery = query(collection(db, 'booking'));
	const unsubscribe = onSnapshot(bookingQuery, (querySnapshot) => {
		listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());

	let requestSort = '';

	async function sortBy() {
		try {
			if (requestSort == 'Name') {
				const sortByNameQuery = query(collection(db, 'booking'), orderBy('firstName', 'asc'));
				const unsubscribe = onSnapshot(sortByNameQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Email') {
				const sortByEmailQuery = query(collection(db, 'booking'), orderBy('email', 'asc'));
				const unsubscribe = onSnapshot(sortByEmailQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Event') {
				const sortByEventQuery = query(collection(db, 'booking'), orderBy('eventType', 'asc'));
				const unsubscribe = onSnapshot(sortByEventQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Date') {
				const sortByDateQuery = query(collection(db, 'booking'), orderBy('date', 'asc'));
				const unsubscribe = onSnapshot(sortByDateQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Time') {
				const sortByTimeQuery = query(collection(db, 'booking'), orderBy('time', 'asc'));
				const unsubscribe = onSnapshot(sortByTimeQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Approved') {
				const sortByApprovedQuery = query(
					collection(db, 'booking'),
					orderBy('time', 'asc'),
					where('status', '==', 'Approved')
				);
				const unsubscribe = onSnapshot(sortByApprovedQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Disapproved') {
				const sortByDisapprovedQuery = query(
					collection(db, 'booking'),
					orderBy('time', 'asc'),
					where('status', '==', 'Disapproved')
				);
				const unsubscribe = onSnapshot(sortByDisapprovedQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			} else if (requestSort == 'Pending') {
				const sortByPendingQuery = query(
					collection(db, 'booking'),
					orderBy('time', 'asc'),
					where('status', '==', 'Pending')
				);
				const unsubscribe = onSnapshot(sortByPendingQuery, (querySnapshot) => {
					listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
				});
				onDestroy(() => unsubscribe());
			}
		} catch (error) {
			console.log(error);
			// alert('Error in sorting');
		}
	}
</script>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<div class="flex justify-between">
		<h1 class="text-3xl font-semibold py-12">Booking History</h1>
		<a href="/admin/bookings" class="hover:underline">Go to Bookings</a>
	</div>
	<div class="flex justify-between">
		<h1 class="text-xl font-semibold">Requests</h1>
		<input type="search" placeholder="Search here" />
		<select bind:value={requestSort} on:click={sortBy} name="" id="">
			<option value="" disabled selected>Select Option</option>
			<option value="Name">Name</option>
			<option value="Email">E-mail Address</option>
			<option value="Event">Type of Event</option>
			<option value="Date">Date</option>
			<option value="Time">Time</option>
			<option value="Approved">Approved</option>
			<option value="Disapproved">Disapproved</option>
			<option value="Pending">Pending</option>
		</select>
	</div>

	<div class="my-5 p-5 overflow-auto shadow-lg border rounded-xl bg-gray-300 hidden md:block">
		<table class="border-2 border-black bg-white w-full text-center">
			<thead class="font-bold bg-gray-500">
				<tr>
					<th class="p-3 text-sm tracking-wide">Name</th>
					<th class="p-3 text-sm tracking-wide">E-mail Address</th>
					<th class="p-3 text-sm tracking-wide">Contact No.</th>
					<th class="p-3 text-sm tracking-wide">Type of Event</th>
					<th class="p-3 text-sm tracking-wide">Date</th>
					<th class="p-3 text-sm tracking-wide">Time</th>
					<th class="p-3 text-sm tracking-wide">Status</th>
					<th class="p-3 text-sm tracking-wide" />
				</tr>
			</thead>
			<tbody>
				{#each listOfBooking as book}
					<tr class="border-t-2 border-black">
						<td class="p-3 text-sm whitespace-nowrap">{book.firstName + ' ' + book.lastName}</td>
						<td class="p-3 text-sm whitespace-nowrap">{book.email}</td>
						<td class="p-3 text-sm whitespace-nowrap">{book.contactNumber}</td>
						<td class="p-3 text-sm whitespace-nowrap">{book.eventType}</td>
						<td class="p-3 text-sm whitespace-nowrap">{book.date}</td>
						<td class="p-3 text-sm whitespace-nowrap">{book.time}</td>
						{#if book.status == 'Approved'}
							<td class="p-3 text-sm whitespace-nowrap text-green-500">{book.status}</td>
						{:else if book.status == 'Disapproved'}
							<td class="p-3 text-sm whitespace-nowrap text-red-500">{book.status}</td>
						{:else}
							<td class="p-3 text-sm whitespace-nowrap">{book.status}</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Small screen -->
	<div class="bg-gray-300 my-5 p-5  selection:grid grid-cols-1 gap-4 md:hidden rounded-lg shadow">
		{#each listOfBooking as book}
			<div class="bg-white space-y-3 p-4 border-2 border-black">
				<div class="flex items-center space-x-2  text-sm">
					<div>
						<span class="font-bold text-sm">Name: </span>
						{book.firstName + ' ' + book.lastName}
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
					<span class="font-bold text-sm">Date: </span>
					{book.date}
					<span class="font-bold text-sm">Time: </span>
					{book.time}
					<span class="font-bold text-sm">Status: </span>
					{book.status}
				</div>
			</div>
			<br />
		{/each}
	</div>
</div>
