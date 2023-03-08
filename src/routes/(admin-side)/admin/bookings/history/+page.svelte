<script>
	import { onSnapshot, query, collection, orderBy, where, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { jsPDF } from 'jspdf';
	import Pagination from '../../Pagination.svelte';

	let listOfBooking = [];
	let sortByField = '';
	let sortByStatus = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', 'in', ['Approved', 'Disapproved']),
		orderBy('dateReviewed', 'desc')
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
				where('status', 'in', ['Approved', 'Disapproved']),
				orderBy(sortByField, 'desc'),
				orderBy('dateReviewed', 'desc')
			);
		} else {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', 'in', ['Approved', 'Disapproved']),
				orderBy(sortByField, 'asc'),
				orderBy('dateReviewed', 'desc')
			);
		}
	}

	async function changeSortByStatus() {
		if (sortByStatus == '') {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', 'in', ['Approved', 'Disapproved']),
				orderBy('dateReviewed', 'desc')
			);
		} else {
			bookingsQuery = query(
				collection(db, 'booking'),
				where('status', '==', sortByStatus),
				orderBy('dateReviewed', 'desc')
			);
		}
	}

	async function searchBookings() {
		let searchByValueCase = searchByValue.toLowerCase();
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			orderBy(searchByField, 'asc'),
			where('status', 'in', ['Approved', 'Disapproved']),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function resetButton() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Approved', 'Disapproved']),
			orderBy('dateReviewed', 'desc')
		);
		searchByValue = '';
	}

	async function generateReport() {
		const reportQuery = query(collection(db, 'booking'), where('status', '!=', 'Pending'));
		const reportSnap = await getDocs(reportQuery);

		const report = new jsPDF();

		let text = '';

		reportSnap.forEach((booking) => {
			text += `Name: ${booking.data().firstNameDisplay} ${booking.data().lastNameDisplay}\n`;
			text += `E-mail Address: ${booking.data().email}\n`;
			text += `Contact No.: ${booking.data().contactNumber}\n`;
			text += `Event Type: ${booking.data().eventTypeDisplay}\n`;
			text += `Date Reserved: ${booking.data().dateReserved.toDate().toLocaleDateString()} ${booking
				.data()
				.dateReserved.toDate()
				.toLocaleTimeString()}\n`;
			text += `Booking Status: ${booking.data().status}\n`;
			text += `Date Reviewed: ${booking.data().dateReviewed.toDate().toLocaleDateString()} ${booking
				.data()
				.dateReviewed.toDate()
				.toLocaleTimeString()}\n`;
			text += `Payment Status: ${booking.data().paymentStatus}\n\n`;
		});

		report.text('Southview Homes 3 Booking History Report', 10, 18);
		report.text(text, 10, 34);
		report.save('Southview-Homes-3-Booking-Report.pdf');
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
	<title>Booking History - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Bookings History</h1>
	<div class="flex justify-end">
		<a href="/admin/bookings/" class="btn btn-primary ">Go Back</a>
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
		<select
			bind:value={sortByStatus}
			on:change={changeSortByStatus}
			class="select select-bordered my-4"
		>
			<option value="" selected>Status Filter</option>
			<option value="Approved">Approved</option>
			<option value="Disapproved">Disapproved</option>
		</select>
		<div class="my-4">
			<button class="btn btn-primary" on:click={generateReport}>Generate Report</button>
		</div>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Email Address</th>
						<th class="text-lg">Contact Number</th>
						<th class="text-lg">Type of Event</th>
						<th class="text-lg">Date and Time</th>
						<th class="text-lg">Booking Status</th>
						<th class="text-lg">Date Reviewed</th>
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="py-24 text-center" colspan="8">No Booking History Found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfBooking as book, i}
						<!-- {#if book.status != 'Pending'} -->
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
							<td>
								{#if book.status == 'Approved'}
									<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold"
										>{book.status}</td
									>
								{:else if book.status == 'Disapproved'}
									<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">{book.status}</td
									>
								{:else if book.status == 'Pending'}
									<td class="p-3 text-sm whitespace-nowrap">{book.status}</td>
								{/if}
							</td>
							<td
								>{book.dateReviewed.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) +
									' at ' +
									book.dateReviewed
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							>
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
			<div class="w-full mx-auto">No Booking History Found</div>
		{/if}
		{#each listOfBooking as book}
			<!-- {#if book.status == 'Approved' || book.status == 'Disapproved'} -->
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
					<div class="font-bold">
						Status:
						{#if book.status == 'Approved'}
							<span class="text-green-500">{book.status}</span>
						{:else if book.status == 'Disapproved'}
							<span class="text-red-500">{book.status}</span>
						{/if}
					</div>
					<div>
						<span class="my-1 font-bold">Date Reviewed:</span>
						{book.dateReviewed
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							book.dateReviewed
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
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
