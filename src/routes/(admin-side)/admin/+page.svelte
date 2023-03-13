<script>
	import { db } from '$lib/firebase/client';
	import {
		getDocs,
		query,
		collection,
		getCountFromServer,
		where,
		limit,
		orderBy
	} from 'firebase/firestore';

	let countOfPendingBooks = '';
	let countOfAccounts = '';
	let dueCount = '';
	let listOfEvents = [];
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

	async function getUpcoming() {
		const eventsSnapshot = await getDocs(eventQuery);
		listOfEvents = eventsSnapshot.docs.map((doc) => doc.data());
	}

	getUpcoming(eventQuery);
	getCount();
</script>

<svelte:head>
	<title>Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Dashboard</h1>
	<div class="flex flex-col md:flex-row pt-4">
		<div class="basis-1/3 flex flex-col items-center lg:items-end space-y-4 p-5">
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
		<div class="basis-2/3 flex justify-center p-5">
			<div class="w-full max-w-3xl shadow-2xl border rounded-xl bg-base-100">
				<div class="p-4">
					<h1 class="text-2xl mb-8 font-bold pt-6 px-8">Upcoming Events</h1>
					<p class="divider"></p>
					<div class="flex flex-col space-y-8 text-md px-8 py-4">
						{#each listOfEvents as event}
							<!-- <div>
							<p class="font-medium text-md mb-3">Christmas Party</p>
							<p>Dec 18 3:00 PM</p>
						</div>
						<div>
							<p class="font-medium text-md mb-3">New Years Gathering</p>
							<p>Dec 31 10:00 PM</p>
						</div>
						<div>
							<p class="font-medium text-md mb-3">Meeting</p>
							<p>Jan 3 8:00 PM</p>
						</div> -->
							<div>
								<p class="font-semibold text-lg mb-4">{event.titleDisplay}</p>
								<p>{event.date}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
