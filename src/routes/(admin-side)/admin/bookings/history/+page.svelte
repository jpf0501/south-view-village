<script>
	import {
		getDocs,
		query,
		collection,
		orderBy,
		where,
		getCountFromServer,
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { jsPDF } from 'jspdf';
	import 'jspdf-autotable';
	import toast from 'svelte-french-toast';
	import Papa from 'papaparse';
	import * as XLSX from 'xlsx';
 
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
	let generatePopUp, reportPreview = false;
	let errors = {}
	// report variables
	let report, docType, reportUri, csvData, wb;

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
			where('status', 'in', ['Completed', 'Disapproved', 'Cancelled']),
			orderBy(sortByField, order),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function changeSortByStatus() {
		bookingsQuery = query(
			collection(db, 'booking'),
			sortByStatus
				? where('status', '==', sortByStatus)
				: where('status', 'in', ['Completed', 'Disapproved', 'Cancelled']),
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
			where('status', 'in', ['Completed', 'Disapproved', 'Cancelled']),
			orderBy('dateReviewed', 'desc')
		);
	}

	async function resetButton() {
		bookingsQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Completed', 'Disapproved', 'Cancelled']),
			orderBy('dateReviewed', 'desc')
		);
		searchByValue = '';
	}

	async function generateReport() {
	report = new jsPDF();
	reportUri = '';
	let generateQuery = query(
		collection(db, 'booking'),
		where('status', 'in', ['Approved', 'Disapproved', 'Cancelled', 'Completed']),
		where('paymentStatus', '==', 'Paid',),
		where('dateReviewed', '>=', new Date(startDate)),
		where('dateReviewed', '<', new Date(endDate)),
	);

		const generateSnapshot = await getDocs(generateQuery);
		listOfReports = generateSnapshot.docs.map((doc) => doc.data());

		let approvedQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Approved'),
			where('paymentStatus', '==', 'Paid'),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate))
		);
		let disapprovedQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Disapproved'),
			where('paymentStatus', '==', 'Paid'),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate))
		);
		let cancelledQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Cancelled'),
			where('paymentStatus', '==', 'Paid'),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate))
		);
		let completedQuery = query(
			collection(db, 'booking'),
			where('status', '==', 'Completed'),
			where('paymentStatus', '==', 'Paid'),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate))
		);

		let entrySnapshotCount = await getCountFromServer(generateQuery);
		let approvedSnapshotCount = await getCountFromServer(approvedQuery);
		let disapprovedSnapshotCount = await getCountFromServer(disapprovedQuery);
		let	cancelledSnapshotCount = await getCountFromServer(cancelledQuery);
		let completedSnapshotCount = await getCountFromServer(completedQuery);
		let entryCount = entrySnapshotCount.data().count;
		let approvedCount = approvedSnapshotCount.data().count;
		let disapprovedCount = disapprovedSnapshotCount.data().count;
		let cancelledCount = cancelledSnapshotCount.data().count;
		let completedCount = completedSnapshotCount.data().count;
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

		report.setFontSize(10).text('Total Number of Paid Reservations', 18, 75);
		report.text('Reservation Fee', 18, 83);
		report.text('Paid Reservation Number Breakdown', 18, 91);
		report.text('Total Earned Amount', 18, 140); // 125
		report.text('Signed By', 168, 235, { align: 'right' });
		report.setFont('Times', 'normal').text('Approved Reservations', 27, 101);
		report.setFont('Times', 'normal').text('Disapproved Reservations', 27, 109);
		report.setFont('Times', 'normal').text('Cancelled Reservations', 27, 117);
		report.setFont('Times', 'normal').text('Completed Reservations', 27, 125);
		if (entryCount === 1) {
			report.text(`${entryCount} Record`, 190, 75, { align: 'right' });
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
		if (disapprovedCount === 0) {
			report.text('No Entries', 190, 109, { align: 'right' });
		} else if (disapprovedCount === 1) {
			report.text(`${disapprovedCount} Entry`, 190, 109, { align: 'right' });
		} else {
			report.text(`${disapprovedCount} Entries`, 190, 109, { align: 'right' });
		}
		if (cancelledCount === 0) {
			report.text('No Entries', 190, 117, { align: 'right' });
		} else if (cancelledCount === 1) {
			report.text(`${cancelledCount} Entry`, 190, 117, { align: 'right' });
		} else {
			report.text(`${cancelledCount} Entries`, 190, 117, { align: 'right' });
		}
		if (completedCount === 0) {
			report.text('No Entries', 190, 125, { align: 'right' });
		} else if (completedCount === 1) {
			report.text(`${completedCount} Entry`, 190, 125, { align: 'right' });
		} else {
			report.text(`${completedCount} Entries`, 190, 125, { align: 'right' });
		}
		report.text(`PHP ${totalEarnings}.00`, 190, 140, { align: 'right' });
		report.line(18, 132, 190, 132);
		report.line(130, 250, 190, 250);
		report.text('HOA Treasurer', 171, 258, { align: 'right' });
		report.addPage();
		report.autoTable({ margin: { top: 20, bottom: 20 }, html: '#generate-table' });
		reportUri = report.output('datauristring');
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

	async function saveAsPdf() {
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
	}

	async function saveAsCsv() {
		const blob = new Blob([csvData], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
    	a.href = url;
    	a.download = `Southview_Homes_3_${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}-${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}_Reservation_Report.csv`
    	a.click();

		URL.revokeObjectURL(url);
	}

	async function saveAsXlsx() {
		XLSX.writeFile(wb, `Southview_Homes_3_${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}-${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}_Reservation_Report.xlsx`);
	}

	async function generateCSV() {
	reportUri = '';
	csvData = ''
		let generateQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Approved', 'Disapproved', 'Cancelled', 'Completed']),
			where('paymentStatus', '==', 'Paid',),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate)),
		);

		const generateSnapshot = await getDocs(generateQuery);
		let csvReport = generateSnapshot.docs.map((doc) => {
			const data = doc.data()
			const bookDate = data.bookDate.toDate();
			const endTime = data.endTime.toDate();
			const dateReviewed = data.dateReviewed.toDate();
			return {
				fullName: data.firstNameDisplay + " " + data.lastNameDisplay, 
				email: data.email,
				contactNumber: data.contactNumber,
				eventType: data.eventType,
				bookDate: bookDate.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}),
				time: bookDate.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }) + " - " + endTime.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }), 
				status: data.status,
				paymentStatus: data.paymentStatus,
				lastApprover: data.approvedBy ? data.approvedBy : "N/A",
				dateReviwed: dateReviewed.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) + " at " + dateReviewed.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }),
				isRescheduled: data.isRescheduled ? 'Yes' : 'No',
			}	
		}
		);

		csvData = Papa.unparse(csvReport)

		//console.log(csvData);
	}

	async function generateXlsx() {
		reportUri = '';
		wb = '';

		let generateQuery = query(
			collection(db, 'booking'),
			where('status', 'in', ['Approved', 'Disapproved', 'Cancelled', 'Completed']),
			where('paymentStatus', '==', 'Paid',),
			where('dateReviewed', '>=', new Date(startDate)),
			where('dateReviewed', '<', new Date(endDate)),
		);

		const generateSnapshot = await getDocs(generateQuery);
		let xlsxReport = generateSnapshot.docs.map((doc) => {
			const data = doc.data()
			const bookDate = data.bookDate.toDate();
			const endTime = data.endTime.toDate();
			const dateReviewed = data.dateReviewed.toDate();
			return {
				fullName: data.firstNameDisplay + " " + data.lastNameDisplay, 
				email: data.email,
				contactNumber: data.contactNumber,
				eventType: data.eventType,
				bookDate: bookDate.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}),
				time: bookDate.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }) + " - " + endTime.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }), 
				status: data.status,
				paymentStatus: data.paymentStatus,
				lastApprover: data.approvedBy ? data.approvedBy : "N/A",
				dateReviwed: dateReviewed.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) + " at " + dateReviewed.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }),
				isRescheduled: data.isRescheduled ? 'Yes' : 'No',
			}	
		});

		const ws = XLSX.utils.json_to_sheet(xlsxReport);
		wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Data');

		//console.log('Data exported');
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
			docType: !docType
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
		if (docType == "pdf"){
			generateReport();
			openPreview();
		}
		else if (docType == "csv"){
			generateCSV()
			openPreview();
		}
		if (docType == "xls"){
			generateXlsx();
			openPreview();
		}
		if (docType == "docx"){
			generateDocx();
			console.log("hi docx")
		}
		
	}

	function openGenerate() {
		generatePopUp = true;
	}

	function closeGenerate() {
		generatePopUp = false;
	}

	function openPreview() {
		reportPreview = true;
	}

	function closePreview() {
		reportPreview = false;
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
		<p class="mt-6 text-sm text-gray-500">Select document type to generate</p>
		<select
			bind:value={docType}
			class="mt-6 input input-bordered w-full max-w-xs"
		>
			<option value="pdf">PDF</option>
			<option value="csv">CSV</option>
			<option value="xls">XLSX</option>
			<option value="docx">DOCX</option>
		</select>

		{#if errors.docType}
			<p class="text-red-500 text-sm italic mb-1">Document type is required</p>
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

{#if reportPreview}
<div
class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
>
<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
<div class="relative z-50 w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
	<div class="p-6">
		<h2 class="text-lg font-medium">Booking Payment Report Preview</h2>
		<div class="divider mt-3 mb-5"></div>
		<!-- svelte-ignore a11y-missing-attribute -->
		{#if reportUri}
			<iframe id="pdfIframe" src={reportUri} frameborder="2" width="100%" height="500px"></iframe>
		{:else if !reportUri && docType == "csv" || !reportUri && docType == "xls"}
			<div class="flex flex-row gap-2 justify-center text-center m-48">
				Preview is not available for this file type ({(docType == "csv") ? '.csv' : (docType == "xls") ? '.xlsx' : 'unknown'})
			</div>
		{:else}
			<div class="flex flex-row gap-2 justify-center text-center m-48">
				<span class="loading loading-spinner loading-md"></span>Loading...
			</div>
		{/if}
	</div>
	<div class="flex justify-end px-6 gap-2 py-4">
		{#if reportUri && docType == "pdf"}
		<button class="btn btn-primary" on:click={saveAsPdf}
		>Save as PDF</button
	>
		{:else if !reportUri && docType == "pdf"}
		<button class="btn btn-primary" on:click={saveAsPdf} disabled
		>Save as PDF</button
	>
		{:else if !reportUri && docType == "csv" || !reportUri && docType == "xls"} 
			<button class="btn btn-primary" on:click={(docType == "csv") ? saveAsCsv() : (docType == "xls") ? saveAsXlsx() : null}
			>Save as {(docType == "csv") ? 'CSV' : (docType == "xls") ? 'XLSX' : 'unknown'}</button
		>
		{/if}
		
		<button class="btn btn-error text-white" on:click={closePreview}>Close</button>
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
			<th class="text-lg">Date</th>
			<th class="text-lg">Time</th>
			<th class="text-lg">Status</th>
			<th class="text-lg">Amount Paid</th>
			<!-- <th class="text-lg">Date Reviewed</th> -->
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
								})}</td>
				<td>{book.bookDate
					.toDate()
					.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })} - {book.endTime.toDate()
					.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td>
				<td>
					{#if book.status == 'Approved'}
						<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold">{book.status}</td>
					{:else if book.status == 'Disapproved'}
						<td class="p-3 text-sm whitespace-nowrap text-red-500 font-bold">{book.status}</td>
					{:else if book.status == 'Completed'}
						<td class="p-3 text-sm whitespace-nowrap text-green-500 font-bold">{book.status}</td>
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
						<th class="text-lg">Event Type</th>
						<th class="text-lg">Date</th>
						<th class="text-lg">Time</th>
						<th class="text-lg">Status</th>
						<th class="text-lg">Payment Status</th>
						<th class="text-lg">Last Approved/Disapproved By</th>
						<th class="text-lg">Date Reviewed</th>
						<th class="text-lg">Is Rescheduled?</th>
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
							<td>{book.bookDate.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}</td>
							<td>{book.bookDate
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })} - {book.endTime.toDate().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</td>
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
							<td>{book.paymentStatus}</td>
							<td>{book.approvedBy ? book.approvedBy : "N/A"}</td>
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
							<td>{book.isRescheduled ? "Yes" : "No"}</td>
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
