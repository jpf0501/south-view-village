<script>
	import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfBooking = [];
	let sortByField = '';
	let sortByStatus = '';
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

	async function changeSortByStatus() {
		if (sortByStatus == '') {
			bookingsQuery = query(collection(db, 'booking'), orderBy('bookDate', 'desc'));
		} else {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', '==', sortByStatus),
				orderBy('bookDate', 'desc')
			);
		}
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
</script>

<svelte:head>
	<title>Booking History - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 px-12">
	<div class="flex justify-between py-10">
		<h1 class="text-3xl font-semibold">Booking History</h1>
		<a href="/admin/bookings" class="btn btn-primary">Go to Bookings</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<form on:submit|preventDefault={searchBookings}>
			<select bind:value={searchByField} class="select select-bordered" required>
				<option value="" disabled selected>Search Filter</option>
				<option value="firstname">Name</option>
				<option value="email">E-mail Address</option>
				<option value="eventType">Type of Event</option>
				<option value="bookDate">Date and Time</option>
			</select>
			<input type="search" placeholder="Search here" required class="input input-bordered mx-2" bind:value={searchByValue} />
		</form>
		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered">
			<option value="" disabled selected>Sort By</option>
			<option value="firstname">Name</option>
			<option value="email">E-mail Address</option>
			<option value="eventType">Type of Event</option>
			<option value="bookDate">Date and Time</option>
		</select>
		<select bind:value={sortByStatus} on:change={changeSortByStatus} class="select select-bordered">
			<option value="" selected>Status Filter</option>
			<option value="Approved">Approved</option>
			<option value="Disapproved">Disapproved</option>
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
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th></th>
						<th class="text-lg">Name</th>
						<th class="text-lg">Email Address</th>
						<th class="text-lg">Contact Number</th>
						<th class="text-lg">Type of Event</th>
						<th class="text-lg">Date and Time</th>
						<th class="text-lg">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each listOfBooking as book}
						{#if book.status != 'Pending'}
							<tr class="hover">
								<td class="count"></td>
								<td>{book.firstNameDisplay + ' ' + book.lastNameDisplay}</td>
								<td>{book.email}</td>
								<td>{book.contactNumber}</td>
								<td>{book.eventTypeDisplay}</td>
								<td
									>{book.bookDate.toDate().toLocaleDateString() +
										' at ' +
										book.bookDate.toDate().toLocaleTimeString()}</td
								>
								<td>
									{#if book.status == 'Approved'}
										<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold"
											>{book.status}</td
										>
									{:else if book.status == 'Disapproved'}
										<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold"
											>{book.status}</td
										>
									{:else if book.status == 'Pending'}
										<td class="p-3 text-sm whitespace-nowrap">{book.status}</td>
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->

	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#each listOfBooking as book}
			{#if book.status == 'Approved' || book.status == 'Disapproved'}
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
							{book.bookDate.toDate().toLocaleDateString() +
								' at ' +
							book.bookDate.toDate().toLocaleTimeString()}
						</div>
						<div class="font-bold">
							Status:
							{#if book.status == 'Approved'}
								<span class="text-green-500">{book.status}</span>
							{:else if book.status == 'Disapproved'}
								<span class="text-red-500">{book.status}</span>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
