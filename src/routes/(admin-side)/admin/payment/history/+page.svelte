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

	if (currentMonth === '01') {
		// if current month is January, set start date to December of last year
		startDate = new Date(`${previousYear}-12-${day}`);
	} else {
		// set start date to last month date
		startDate = new Date(`${currentYear}-${previousMonth}-${day}`);
	}

	if (currentMonth === '12') {
		// if current month is December, set end date to January of next year
		endDate = new Date(`${currentYear + 1}-01-${day}`);
	} else {
		// otherwise, set end date to next month
		let nextMonth = (date.getMonth() + 1).toString().padStart(2, '0');
		endDate = new Date(`${currentYear}-${nextMonth}-${day}`);
	}

	let listOfStreets = [];
	let listOfReports = [];
	let listOfPayments = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let paymentsQuery = query(collection(db, 'payments'));
	let generateQuery = query(
		collection(db, 'payments'),
		where('paymentTime', '>=', startDate),
		where('paymentTime', '<', endDate)
	);
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

	async function generateReport() {
		const report = new jsPDF();

		let yOffset = 8;
		let y = 87;
		let entrySnapshotCount = await getCountFromServer(generateQuery);
		let entryCount = entrySnapshotCount.data().count;
		let totalEarnings = 500 * entryCount;
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
		if (currentMonth == '01') {
			report.text(
				`${monthName[previousMonth - 1]} ${previousYear} Monthly Dues Earnings Report`,
				width / 2,
				45,
				{ align: 'center' }
			);
		} else {
			report.text(
				`${monthName[previousMonth - 1]} ${currentYear} Monthly Dues Earnings Report`,
				width / 2,
				45,
				{ align: 'center' }
			);
		}
		report.setFontSize(10).text('Total Count of Paid Residents', 18, 62);
		report.text('Monthly Due Fee', 18, 70);
		report.text('Resident Count Summary by Street', 18, 78);
		report.text('Total Earned Amount', 18, 220); // 125
		report.text('Signed By', 168, 245, { align: 'right' });
		report.setFont('Times', 'normal');
		for (let i = 0; i < listOfStreets.length; i++) {
			const street = listOfStreets[i];
			const residentQuery = query(
				collection(db, 'payments'),
				where('addressStreet', '==', street.streetName),
				where('paymentTime', '>=', startDate),
				where('paymentTime', '<', endDate)
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
		if (entryCount === 1) {
			report.text(`${entryCount} Resident`, 190, 62, { align: 'right' });
		} else {
			report.text(`${entryCount} Residents`, 190, 62, { align: 'right' });
		}
		report.text('PHP 500.00', 190, 70, { align: 'right' });
		report.text(`PHP ${totalEarnings}.00`, 190, 220, { align: 'right' });
		report.line(18, 213, 190, 213);
		report.line(130, 260, 190, 260);
		report.text('HOA Treasurer', 171, 268, { align: 'right' });
		report.addPage();
		report.autoTable({ margin: { top: 20, bottom: 20 }, html: '#generate-table' });
		if (currentMonth == '01') {
			report.save(
				`Southview-Homes-3-${monthName[previousMonth - 1]}-${previousYear}-Monthly-Dues-Report.pdf`
			);
		} else {
			report.save(
				`Southview-Homes-3-${monthName[previousMonth - 1]}-${currentYear}-Monthly-Dues-Report.pdf`
			);
		}

		if (currentMonth == '01') {
			toast.success(
				`Monthly dues report for ${monthName[previousMonth - 1]} ${previousYear} generated!`
			);
		} else {
			toast.success(
				`Monthly dues report for ${monthName[previousMonth - 1]} ${currentYear} generated!`
			);
		}
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
				<td>PHP 500.00</td>
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

		<button class="btn btn-primary my-4" on:click={generateReport}>Generate Report</button>
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
