<script>
	import {
		getDocs,
		query,
		collection,
		orderBy,
		where,
		getCountFromServer
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { jsPDF } from 'jspdf';
	import 'jspdf-autotable';
	import toast from 'svelte-french-toast';

	const monthName = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	let date = new Date();
	let previousYear = date.getFullYear() - 1;
	let currentYear = date.getFullYear();
	let previousMonth = date.getMonth().toString().padStart(2, '0');
	let currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');
	let day = '01';
	let startDate, endDate;
	let generatePopUp = false;
	let errors = {}

	// if (currentMonth === '01') {
	// 	// if current month is January, set start date to December of last year
	// 	startDate = new Date(`${previousYear}-12-${day}`);
	// } else {
	// 	// set start date to last month date
	// 	startDate = new Date(`${currentYear}-${previousMonth}-${day}`);
	// }

	// if (currentMonth === '12') {
	// 	// if current month is December, set end date to January of next year
	// 	endDate = new Date(`${currentYear + 1}-01-${day}`);
	// } else {
	// 	// otherwise, set end date to next month
		
	// 	endDate = new Date(`${currentYear}-${currentMonth}-${day}`);
	// }

	let listOfBooking = [];
	let listOfReports = [];
	let sortByField = '';
	let sortByStatus = '';
	let searchByField = '';
	let searchByValue = '';
	let bookingsQuery = query(
		collection(db, 'booking'),
		where('status', 'in', ['Completed', 'Cancelled', 'Disapproved']),
		orderBy('dateReviewed', 'desc')
	);

	async function changeSortBy() {
		const order = sortByField === 'bookDate' ? 'desc' : 'asc';
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Approved', 'Disapproved', 'Cancelled']),
			orderBy(sortByField, order),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function changeSortByStatus() {
		bookingsQuery = query(
			collection(db, 'booking'),
			sortByStatus
				? where('status', '==', sortByStatus)
				: where('status', 'in', ['Approved', 'Disapproved', 'Cancelled']),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function searchBookings() {
		let searchByValueCase = searchByValue.toLowerCase();
		bookingsQuery = query(
			collection(db, 'booking'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~'),
			orderBy(searchByField, 'asc'),
			where('status', 'in', ['Approved', 'Disapproved', 'Cancelled']),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function resetButton() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Approved', 'Disapproved', 'Cancelled']),
			orderBy('dateReviewed', 'desc')
		);
		searchByValue = '';
	}

	async function generateReport() {
	let generateQuery = query(
		collection(db, 'booking'),
		where('status', '==', 'Approved'),
		where('dateReviewed', '>=', new Date(startDate)),
		where('dateReviewed', '<', new Date(endDate))
	);
		const report = new jsPDF();

		const generateSnapshot = await getDocs(generateQuery);
		listOfReports = generateSnapshot.docs.map((doc) => doc.data());

		let approvedQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Approved'),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate))
		);

		let entrySnapshotCount = await getCountFromServer(generateQuery);
		let approvedSnapshotCount = await getCountFromServer(approvedQuery);
		let entryCount = entrySnapshotCount.data().count;
		let approvedCount = approvedSnapshotCount.data().count;
		let totalEarnings = 500 * entryCount;
		let width = report.internal.pageSize.getWidth();

		totalEarnings = Number(totalEarnings.toFixed(2)).toLocaleString();

		report.addImage('/logo.png', 'PNG', 68, 12, 11, 7);
		report.setFont('Times', 'bold').text('Southview Homes 3', 84, 18);
		report
			.setFont('Times', 'normal')
			.setFontSize(9)
			.text(
				'SVH3 Clubhouse, San Vicente Road, Brgy., San Vicente, San Pedro, Laguna',
				width / 2,
				27,
				{ align: 'center' }
			);
		report.line(10, 34, 200, 34);
		report.setFont('Times', 'bold').setFontSize(11);
		report.text(
			`Total Reservation Earnings Report for ${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} - ${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} `,
			width / 2,
			45,
			{ align: 'center' }
		);

		report.setFontSize(10).text('Total Number of Reservations', 18, 75);
		report.text('Reservation Fee', 18, 83);
		report.text('Reservation Record Numbers', 18, 91);
		report.text('Total Earned Amount', 18, 135); // 125
		report.text('Signed By', 168, 235, { align: 'right' });
		report.setFont('Times', 'normal').text('Approved Reservations', 27, 101);
		if (entryCount === 1) {
			report.text(`${entryCount} Records`, 190, 75, { align: 'right' });
		} else {
			report.text(`${entryCount} Records`, 190, 75, { align: 'right' });
		}
		report.text('PHP 500.00', 190, 83, { align: 'right' });
		if (approvedCount === 0) {
			report.text('No Entries', 190, 101, { align: 'right' });
		} else if (approvedCount === 1) {
			report.text(`${approvedCount} Entry`, 190, 101, { align: 'right' });
		} else {
			report.text(`${approvedCount} Entries`, 190, 101, { align: 'right' });
		}
		report.text(`PHP ${totalEarnings}.00`, 190, 135, { align: 'right' });
		report.line(18, 128, 190, 128);
		report.line(130, 250, 190, 250);
		report.text('HOA Treasurer', 171, 258, { align: 'right' });
		report.addPage();
		report.autoTable({ margin: { top: 20, bottom: 20 }, html: '#generate-table' });
		report.save(
				`Southview_Homes_3_${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}-${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}_Reservation_Report.pdf`
		);
		toast.success(
			`Reservation report for ${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} - ${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} generated!`
		);
	}

	async function getBookingsHitory(bookingsQuery) {
		const bookingsSnapshot = await getDocs(bookingsQuery);
		listOfBooking = bookingsSnapshot.docs.map((doc) => doc.data());
	}

	async function checkInput() {
		errors = {
			starting: !startDate,
			ending: !endDate,
			startCheck: startDate > endDate,
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function submitHandler() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Report generation failed');
			return;
		}
		generateReport();
	}

	function openGenerate() {
		generatePopUp = true;
	}

	function closeGenerate() {
		generatePopUp = false;
	}

	$: getBookingsHitory(bookingsQuery);
</script>

<svelte:head>
	<title>Booking History - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if generatePopUp}
<div
class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
>
<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
	<div class="p-6">
		<h2 class="text-lg font-medium">Generate Booking Report</h2>
		<p class="mt-6 text-sm text-gray-500">Enter starting date of report</p>
		<input
			type="date"
			bind:value={startDate}
			class="mt-6 input input-bordered w-full max-w-xs"
		/>
		{#if errors.starting}
			<p class="text-red-500 text-sm italic mb-1">Start date is required</p>
		{/if}
		<p class="mt-6 text-sm text-gray-500">Enter end date of report</p>
		<input
			type="date"
			bind:value={endDate}
			class="mt-6 input input-bordered w-full max-w-xs"
		/>
		{#if errors.ending}
			<p class="text-red-500 text-sm italic mb-1">End date is required</p>
		{:else if errors.startCheck}
			<p class="text-red-500 text-sm italic mb-1">Start date should not be more recent than end date</p>
		{/if}
	</div>
	<div class="flex justify-end px-6 gap-2 py-4">
		<button class="btn btn-primary" on:click={submitHandler}
			>Generate Report</button
		>
		<button class="btn btn-error text-white" on:click={closeGenerate}>Cancel</button>
	</div>
</div>
</div>
{/if}

<table class="hidden" id="generate-table">
	<thead>
		<tr>
			<th />
			<th class="text-lg">Name</th>
			<!-- <th class="text-lg">Email Address</th>
			<th class="text-lg">Contact Number</th> -->
			<th class="text-lg">Type of Event</th>
			<th class="text-lg">Date and Time</th>
			<th class="text-lg">Booking Status</th>
			<!-- <th class="text-lg">Date Reviewed</th> -->
			<th class="text-lg">Amount Paid</th>
		</tr>
	</thead>
	<tbody>
		{#each listOfReports as book, j}
			<tr>
				<td>{j + 1}</td>
				<td>{book.firstNameDisplay + ' ' + book.lastNameDisplay}</td>
				<!-- <td>{book.email}</td> -->
				<!-- <td>{book.contactNumber}</td> -->
				<td>{book.eventTypeDisplay}</td>
				<td
					>{book.bookDate.toDate().toLocaleDateString('en-us', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					}) +
						' ' +
						book.bookDate
							.toDate()
							.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
				>
				<td>
					{#if book.status == 'Approved'}
						<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold">{book.status}</td>
					{:else if book.status == 'Disapproved'}
						<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">{book.status}</td>
					{:else if book.status == 'Cancelled'}
						<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">{book.status}</td>
					{:else if book.status == 'Pending'}
						<td class="p-3 text-sm whitespace-nowrap">{book.status}</td>
					{/if}
				</td>
				<!-- <td
								>{book.dateReviewed.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) +
									' at ' +
									book.dateReviewed
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							> -->
				<td>PHP 500.00</td>
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
			<!-- <option value="email">E-mail Address</option> -->
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
			<button class="btn btn-primary" on:click={openGenerate}>Generate Report</button>
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
				<tbody>
					{#each listOfBooking as book, i}
						<!-- {#if book.status != 'Pending'} -->
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
							<td>
								{#if book.status == 'Completed'}
									<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold"
										>{book.status}</td
									>
								{:else if book.status == 'Disapproved'}
									<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">{book.status}</td
									>
								{:else if book.status == 'Cancelled'}
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
						{#if book.status === 'Approved'}
							<span class="text-green-500">{book.status}</span>
						{:else if book.status === 'Disapproved'}
							<span class="text-red-500">{book.status}</span>
						{:else if book.status == 'Cancelled'}
							<span class="text-red-500">{book.status}</span>
						{:else if book.status === 'Cancelled'}
							<span class="">{book.status}</span>
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
</div>
