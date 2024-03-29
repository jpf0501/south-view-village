<script>
	import {
		query,
		collection,
		orderBy,
		where,
		getCountFromServer,
		getDocs
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { addLog } from '$lib/logs';
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
	let errors = {};
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

	let listOfStreets = [];
	let listOfReports = [];
	let listOfPayments = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let paymentsQuery = query(collection(db, 'payments'));
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));

	async function changeSortBy() {
		const order = sortByField === 'paymentTime' ? 'desc' : 'asc';
		paymentsQuery = query(collection(db, 'payments'), orderBy(sortByField, order));
	}

	async function searchAccounts() {
		let searchByValueCase = searchByValue.toLowerCase();
		paymentsQuery = query(
			collection(db, 'payments'),
			where(searchByField, '>=', searchByValueCase),
			where(searchByField, '<=', searchByValueCase + '~')
		);
	}

	async function resetButton() {
		paymentsQuery = query(collection(db, 'payments'));
		searchByValue = '';
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
		addLog(`"Generate Payments Report - ${startDate} - ${endDate}"`, 'Payments');
	}

	async function generateReport() {
	report = new jsPDF();
	reportUri = '';
		let generateQuery = query(
		collection(db, 'payments'),
		where('paymentTime', '>=', new Date(startDate)),
		where('paymentTime', '<', new Date(endDate))
	);

		let yOffset = 8;
		let y = 87;
		let entrySnapshotCount = await getCountFromServer(generateQuery);
		let entryCount = entrySnapshotCount.data().count;
		let totalEarnings = 500 * entryCount;
		let paymentFee = 0
		let width = report.internal.pageSize.getWidth();

		totalEarnings = Number(totalEarnings.toFixed(2)).toLocaleString();

		const generateSnapshot = await getDocs(generateQuery);
		const streetSnapshot = await getDocs(streetQuery);
		listOfReports = generateSnapshot.docs.map((doc) => doc.data());
		listOfStreets = streetSnapshot.docs.map((doc) => doc.data());

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
				`Total Monthly Dues Payment Report for ${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} - ${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}`,
				width / 2,
				45,
				{ align: 'center' }
		);
		report.setFontSize(10).text('Total Count of Paid Residents', 18, 62);
		report.text('Standard Monthly Due Fee', 18, 70);
		report.text('Resident Count Summary by Street', 18, 78);
		report.text('Total Earned Amount', 18, 220); // 125
		report.text('Signed By', 168, 245, { align: 'right' });
		report.setFont('Times', 'normal');

		for (let i = 0; i < listOfStreets.length; i++) {
			const street = listOfStreets[i];
			const residentQuery = query(
				collection(db, 'payments'),
				where('addressStreet', '==', street.streetName),
				where('paymentTime', '>=', new Date(startDate)),
				where('paymentTime', '<', new Date(endDate))
			);
			const residentCountSnapshot = await getCountFromServer(residentQuery);
			const residentCount = residentCountSnapshot.data().count;
			report.text(`${street.streetName}`, 27, y);
			if (residentCount === 0) {
				report.text('No payment records', 190, y, { align: 'right' });
			} else if (residentCount === 1) {
				report.text(`${residentCount} Resident`, 190, y, { align: 'right' });
			} else {
				report.text(`${residentCount} Residents`, 190, y, { align: 'right' });
			}
			y += yOffset;
		}

		for (let i = 0; i < listOfReports.length; i++) {
			const payment = listOfReports[i];
			let paymentAmount = payment.paymentFee
			paymentFee = paymentFee + paymentAmount
		}

		if (entryCount === 1) {
			report.text(`${entryCount} Resident`, 190, 62, { align: 'right' });
		} else {
			report.text(`${entryCount} Residents`, 190, 62, { align: 'right' });
		}

		report.text('PHP 500.00', 190, 70, { align: 'right' });
		report.text(`PHP ${new Intl.NumberFormat().format(paymentFee / 100)}.00`, 190, 220, { align: 'right' });
		report.line(18, 213, 190, 213);
		report.line(130, 260, 190, 260);
		report.text('HOA Treasurer', 171, 268, { align: 'right' });
		report.addPage();
		report.autoTable({ margin: { top: 20, bottom: 20 }, html: '#generate-table' });
		reportUri = report.output('datauristring');
		toast.success(`Monthly dues report for ${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} - ${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})} generated!`);
	}

	async function saveAsPdf() {
		report.save(`Southview_Homes_3_${new Date(startDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}-${new Date(endDate).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}_Monthly_Dues_Report.pdf`);
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
											})}_Monthly_Dues_Report.csv`
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
											})}_Monthly_Dues_Report.xlsx`);
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

	async function generateCSV() {
	reportUri = '';
	csvData = ''
	let generateQuery = query(
		collection(db, 'payments'),
		where('paymentTime', '>=', new Date(startDate)),
		where('paymentTime', '<', new Date(endDate))
	);

		const generateSnapshot = await getDocs(generateQuery);
		let csvReport = generateSnapshot.docs.map((doc) => {
			const data = doc.data()
			const paymentTime = data.paymentTime.toDate();
			return {
				fullName: data.firstNameDisplay + " " + data.lastNameDisplay,
				address: "Block " + data.addressBlock + " Lot " + data.addressLot + " " + data.addressStreet + " Street",
				email: data.email,
				contactNumber: "0" + data.contact,
				paymentDate: paymentTime.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}),
				amount: new Intl.NumberFormat().format(data.paymentFee / 100)
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
		collection(db, 'payments'),
		where('paymentTime', '>=', new Date(startDate)),
		where('paymentTime', '<', new Date(endDate))
	);

		const generateSnapshot = await getDocs(generateQuery);
		let xlsxReport = generateSnapshot.docs.map((doc) => {
			const data = doc.data()
			const paymentTime = data.paymentTime.toDate();
			return {
				fullName: data.firstNameDisplay + " " + data.lastNameDisplay,
				address: "Block " + data.addressBlock + " Lot " + data.addressLot + " " + data.addressStreet + " Street",
				email: data.email,
				contactNumber: "0" + data.contact,
				paymentDate: paymentTime.toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}),
				amount: new Intl.NumberFormat().format(data.paymentFee / 100)
			}
		});

		const ws = XLSX.utils.json_to_sheet(xlsxReport);
		wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Data');

		//console.log('Data exported');
	}

	async function getPayments(paymentsQuery) {
		const paymentsSnapshot = await getDocs(paymentsQuery);
		listOfPayments = paymentsSnapshot.docs.map((doc) => doc.data());
	}
	$: getPayments(paymentsQuery);
</script>

<svelte:head>
	<title>Payment History - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if generatePopUp}
<div
class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
>
<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
	<div class="p-6">
		<h2 class="text-lg font-medium">Generate Payment Report</h2>
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
		</select>
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
		<h2 class="text-lg font-medium">Monthly Dues Payment Report Preview</h2>
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
			<th class="text-lg">Address</th>
			<th class="text-lg">Email</th>
			<th class="text-lg">Contact No.</th>
			<th class="text-lg">Payment Date</th>
			<th class="text-lg">Amount</th>
		</tr>
	</thead>
	<tbody>
		{#each listOfReports as payment, j}
			<tr>
				<td>{j + 1}</td>
				<td>{payment.firstNameDisplay} {payment.lastNameDisplay}</td>
				<td>Block {payment.addressBlock} Lot {payment.addressLot} {payment.addressStreet} Street</td
				>
				<td>{payment.email}</td>
				<td>{payment.contact}</td>
				<td
					>{payment.paymentTime.toDate().toLocaleDateString('en-us', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}</td
				>
				<td>PHP {new Intl.NumberFormat().format(payment.paymentFee / 100)}.00</td>
			</tr>
		{/each}
	</tbody>
</table>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Payment History</h1>
	<div class="flex justify-end">
		<a href="/admin/payment/" class="btn btn-primary ">Go Back</a>
	</div>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchAccounts}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="firstName">First Name</option>
					<option value="lastName">Last Name</option>
					<option value="email">Email</option>
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
			<option value="firstName">Firstname</option>
			<option value="lastName">Lastname</option>
			<option value="paymentTime">Payment Date</option>
		</select>

		<button class="btn btn-primary my-4" on:click={openGenerate}>Generate Report</button>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Address</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Contact No.</th>
						<th class="text-lg">Payment Date</th>
						<th class="text-lg">Amount</th>
					</tr>
				</thead>
				<tbody>
					{#each listOfPayments as payment, i}
						<tr class="hover">
							<td>{i + 1}</td>
							<td>{payment.firstNameDisplay} {payment.lastNameDisplay}</td>
							<td
								>Block {payment.addressBlock} Lot {payment.addressLot}
								{payment.addressStreet} Street</td
							>
							<td>{payment.email}</td>
							<td>{payment.contact}</td>
							<td
								>{payment.paymentTime.toDate().toLocaleDateString('en-us', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}</td
							>
							<td>PHP {new Intl.NumberFormat().format(payment.paymentFee / 100)}.00</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#each listOfPayments as user}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{user.firstNameDisplay + ' ' + user.lastNameDisplay}</h2>
					<div>
						<span class="my-1 font-bold">Role:</span>
						{user.role}
					</div>
					<div>
						<span class="my-1 font-bold">Address:</span>
						{'Block ' +
							user.addressBlock +
							' Lot ' +
							user.addressLot +
							' ' +
							user.addressStreet +
							' Street'}
					</div>
					<div>
						<span class="my-1 font-bold">E-mail Address:</span>
						{user.email}
					</div>
					<div class="card-actions justify-end">
						<a href={'/admin/accounts/edit/' + user.id} class="btn glass text-white"
							><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
								/></svg
							></a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
