<script>
	import { db } from '$lib/firebase/client';
	import {
		getDoc,
		doc,
		getDocs,
		query,
		collection,
		getCountFromServer,
		where,
		limit,
		orderBy,
		addDoc,
		serverTimestamp,
	} from 'firebase/firestore';
	import { userStore } from '$lib/store.js';

	let countOfPendingBooks = '';
	let countOfAccounts = '';
	let dueCount = '';
	let listOfEvents = [];
	let listActivityLog = [];
	let dateToday = new Date().toLocaleDateString('fr-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	let eventQuery = query(
		collection(db, 'event'),
		limit(3),
		where('date', '>=', dateToday),
		orderBy('date', 'asc')
	);

	async function getCount() {
		try {
			// Get count of pending books
			const collectionOfPendingBooksQuery = query(
				collection(db, 'booking'),
				where('status', '==', 'Pending')
			);
			const snapshotOfCountOfPendingBookings = await getCountFromServer(
				collectionOfPendingBooksQuery
			);
			countOfPendingBooks = snapshotOfCountOfPendingBookings.data().count;

			// Get count of number of accounts
			const collectionOfAccountsQuery = collection(db, 'accounts');
			const snapshotOfCountOfAccounts = await getCountFromServer(collectionOfAccountsQuery);
			countOfAccounts = snapshotOfCountOfAccounts.data().count;

			// Get pending payment count
			const dueQuery = query(
				collection(db, 'accounts'),
				where('paymentStatus', '==', 'Unpaid'),
				where('paymentHead', '==', true)
			);
			const dueSnapshot = await getCountFromServer(dueQuery);
			dueCount = dueSnapshot.data().count;
		} catch (error) {
			console.log(error);
			alert('Error in counting');
		}
	}

	async function getActivityLog() {
		const logQuery = query(
			collection(db, 'adminlogs'),
			limit(10),
			orderBy('date', 'desc')
			);
		const adminLogSnapshot = await getDocs(logQuery);
		listActivityLog = adminLogSnapshot.docs.map((doc) => doc.data());
	}

	async function getUpcoming() {
		const eventsSnapshot = await getDocs(eventQuery);
		listOfEvents = eventsSnapshot.docs.map((doc) => doc.data());
	}

	async function addLog() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		let user = snapshot.data();

		try {
			await addDoc(collection(db, 'adminlogs'), {
				activity: user.firstNameDisplay + ", " + user.lastNameDisplay + " viewed Dashboard module.",
				pageRef: 'Dashboard',
				date: serverTimestamp()
			});
		} catch(err) {
			console.log(err);
		}
	}

	getUpcoming(eventQuery);
	getCount();
	//addLog();
	getActivityLog();
	
</script>

<svelte:head>
	<title>Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Dashboard</h1>
	<div class="flex flex-row justify-center items-center text-center gap-4 p-5">
		<div
			class="w-60 h-40 flex flex-col justify-center items-center overflow-hidden shadow-lg border rounded-xl bg-base-100"
		>
		<p class="text-3xl font-semibold">{dueCount}</p>
		{#if dueCount === 1}
			<p class="text-md mt-2">Unpaid Resident</p>
		{:else}
			<p class="text-md mt-2">Unpaid Residents</p>
		{/if}
		</div>
		<div
			class="w-60 h-40 flex flex-col justify-center items-center overflow-hidden shadow-lg border rounded-xl bg-base-100"
		>
			<p class="text-3xl font-semibold">{countOfPendingBooks}</p>
			{#if countOfPendingBooks === 1}
				<p class="text-md mt-2">Pending Reservation</p>
			{:else}
				<p class="text-md mt-2">Pending Reservations</p>
			{/if}
		</div>
		<div
			class="w-60 h-40 flex flex-col justify-center items-center overflow-hidden shadow-lg border rounded-xl bg-base-100"
		>
			<p class="text-3xl font-semibold">{countOfAccounts}</p>
			
			{#if countOfAccounts === 1}
				<p class="text-md mt-2">Registered Account</p>
			{:else}
				<p class="text-md mt-2">Registered Accounts</p>
			{/if}
		</div>
	</div>
	<div class="flex justify-center pb-5">
		<div class="w-full shadow-2xl border rounded-xl bg-base-100">
			<div class="p-4">
				<h1 class="text-2xl mb-8 font-bold pt-6 px-8">Upcoming Events</h1>
				<p class="divider"></p>
				<div class="flex flex-col space-y-8 text-md px-8 pb-4">
					{#each listOfEvents as event}
						<div>
							<p class="font-semibold text-lg mb-4">{event.titleDisplay}</p>
							<p>{event.date}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="flex justify-center">
		<div class="w-full shadow-2xl border rounded-xl bg-base-100">
			<div class="p-4">
				<h1 class="text-2xl mb-8 font-bold pt-6 px-8">Activity Log</h1>
				<p class="divider"></p>
				<div class="flex flex-col space-y-8 text-md px-8">
					<div class="overflow-x-auto">
						<table class="table">
						  <!-- head -->
						  <thead>
							<tr>
							  <th>Date</th>
							  <th>Activity</th>
							  <th>Module</th>
							</tr>
						  </thead>
						  <tbody>
							{#each listActivityLog as log}
							<tr>
							  <td>{log.date.toDate().toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' })} {log.date.toDate().toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td>
							  <td>{log.activity}</td>
							  <td>{log.pageRef}</td>
							</tr>
							{/each}
						  </tbody>
						</table>
					  </div>					
				</div>
			</div>
		</div>
	</div>
</div>
	
	
