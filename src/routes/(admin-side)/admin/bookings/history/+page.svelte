<script>
	import { onSnapshot, query, collection, orderBy, where, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import { jsPDF } from 'jspdf';
	import autoTable from 'jspdf-autotable'
	import Pagination from '../../Pagination.svelte';

	let date = new Date();
	let currentYear = date.getFullYear();
	// let previousMonth = (date.getMonth()).toString().padStart(2, "0");
	let currentMonth = (date.getMonth() + 1).toString().padStart(2, "0");
	let nextMonth = (date.getMonth() + 2).toString().padStart(2, "0");
	let day = "01";
	let startDate = new Date(`${currentYear}-${currentMonth}-${day}`);
	let endDate = new Date(`${currentYear}-${nextMonth}-${day}`);

	console.log(startDate)

	let listOfBooking = [];
	let listOfReports = [];
	let sortByField = '';
	let sortByStatus = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', 'in', ['Approved', 'Disapproved']),
		orderBy('dateReviewed', 'desc')
	);
	let generateQuery = query(collection(db, 'booking'), where('status', '==', 'Approved'), where('dateReviewed', '>=', startDate), where('dateReviewed', '<', endDate));

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
		listOfBooking.length === 0 ? (noResult = true) : (noResult = false);
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

	async function generateTable(generateQuery) {
		const unsubscribe = onSnapshot(generateQuery, (querySnapshot) => {
				listOfReports = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
		onDestroy(() => unsubscribe());
	}

	async function generateReport() {
		const report = new jsPDF();
		report.text('Southview Homes 3 Booking History Report', 50, 18);
		report.setFontSize(10)
		report.text('SVH3 Clubhouse, San Vicente Road, Brgy., San Vicente, San Pedro, Laguna', 43, 27);
		report.line(10, 34, 200, 34);
		report.autoTable({ margin: { top: 40 }, html: '#generate-table' })
		report.save('Southview-Homes-3-Booking-Report.pdf');
	}

	$: {
		getBookings(bookingsQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
			totalRecords = querySnapshot.docs.length;
			totalPages = Math.ceil(totalRecords / pageSize);
		});
		onDestroy(() => unsubscribe());
	}
	function goToPage(page) {
		currentPage = page;
	}
	$: generateTable(generateQuery)
</script>

<svelte:head>
	<title>Booking History - Southview Homes 3 Admin Panel</title>
</svelte:head>

<table class="hidden" id="generate-table">
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
	<tbody>
		{#each listOfReports as book, j}
		<tr>
			<td>{j + 1}</td>
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
		{/each}
	</tbody>
</table>

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
