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
	let bookingStatus = '';
	let bookingPaymentStatus = '';
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
		let searchByValueCase = searchByValue.toLowerCase();
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	$: getBookings(bookingsQuery);

	async function changeStatus(bookingId, paymentStatus) {
		try {
			const bookRef = doc(db, 'booking', bookingId);
			const data = {
				status: bookingStatus
			};
			if (paymentStatus == 'Unpaid' && bookingStatus == 'Approved') {
				alert('Only paid bookings can be approved');
			} else {
				await updateDoc(bookRef, data);
				alert('Booking request has been ' + bookingStatus);
			}
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

	async function sendPaymentEmail(bookEmail) {
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

<svelte:head>
	<title>Booking Requests - Southview Homes 3 Admin Panel</title>
</svelte:head>

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
	<div class="w-full p-6 mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th class="text-lg">Name</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact Number</th>
						<th class="text-lg">Type of Event</th>
						<th class="text-lg">Date and Time</th>
						<th class="text-lg">Payment Status</th>
						<th colspan="2" />
					</tr>
				</thead>
				<tbody>
					{#each listOfBooking as book}
						{#if book.status == 'Pending'}
							<tr class="hover">
								<td>{book.firstNameDisplay + ' ' + book.lastNameDisplay}</td>
								<td>{book.email}</td>
								<td>{book.contactNumber}</td>
								<td>{book.eventTypeDisplay}</td>
								<td
									>{book.bookDate.toDate().toLocaleDateString() +
										' at ' +
										book.bookDate.toDate().toLocaleTimeString()}</td
								>
								<td
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
										<button
											on:click={() => (bookingStatus = 'Approved')}
											type="submit"
											class="py-2 px-2 text-green-500 font-bold">Approve</button
										>
										<button
											on:click={() => (bookingStatus = 'Disapproved')}
											type="submit"
											class="py-2 px-2 text-red-500 font-bold">Dissaprove</button
										>
									</form></td
								>
								<td
									><button
										on:click={sendPaymentEmail(book.email)}
										type="button"
										class="py-2 px-2 text-blue-500 font-bold hover:underline">Send Payment</button
									></td
								>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="bg-gray-300 my-5 p-5  selection:grid grid-cols-1 gap-4 md:hidden rounded-lg shadow">
		{#each listOfBooking as book}
			{#if book.status == 'Pending'}
				<div class="bg-white space-y-3 p-4 border-2 border-black">
					<div class="flex items-center space-x-2  text-sm">
						<div>
							<span class="font-bold text-sm">Name: </span>
							{book.firstNameDisplay + ' ' + book.lastNameDisplay}
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
						{book.eventTypeDisplay}
					</div>
					<div>
						<span class="font-bold text-sm">Date and Time </span>
						{book.bookDate.toDate().toLocaleDateString() +
							' at ' +
							book.bookDate.toDate().toLocaleTimeString()}
					</div>
					<div class="font-bold">
						Status:
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
						<form on:submit|preventDefault={changeStatus(book.id)}>
							<button
								on:click={() => (bookingStatus = 'Approved')}
								type="submit"
								class="py-2 px-2 text-green-500 font-bold">Approve</button
							>
							<button
								on:click={() => (bookingStatus = 'Disapproved')}
								type="submit"
								class="py-2 px-2 text-red-500 font-bold">Dissaprove</button
							>
						</form>
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
