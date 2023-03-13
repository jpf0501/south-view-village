<script>
	import { getDocs, query, collection, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { calendarDate } from '$lib/store';

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

	// convert $calendarDate to a Date object
	let currentDayTimeStamp = new Date($calendarDate);

	// Convert $calendarDate to a Date object
	// Para makuha date object ng next day
	let nextDayTimeStamp = new Date($calendarDate);

	// Get the year and month of $calendarDate
	let year = nextDayTimeStamp.getFullYear();
	let month = nextDayTimeStamp.getMonth();

	// Get the last day of the month
	let lastDayOfMonth = new Date(year, month + 1, 0).getDate();

	// Check if $calendarDate is the last day of the month
	if (nextDayTimeStamp.getDate() === lastDayOfMonth) {
		// If $calendarDate is the last day of the month, increment the month and set the day to 1
		month++;
		nextDayTimeStamp.setMonth(month);
		nextDayTimeStamp.setDate(1);

		// Check if $calendarDate is the last day of the year
		if (month === 12) {
			year++;
			nextDayTimeStamp.setFullYear(year);
		}
	} else {
		// If $calendarDate is not the last day of the month, simply increment the day by 1
		nextDayTimeStamp.setDate(nextDayTimeStamp.getDate() + 1);
	}

	// Format the next day as yyyy-mm-dd
	console.log(nextDayTimeStamp);

	let dateTitle = $calendarDate.split('-');
	let monthNumber = dateTitle[1];

	let listOfBookings = [];
	let listOfEvents = [];
	let eventsQuery = query(collection(db, 'event'), where('date', '==', $calendarDate));
	let booksQuery = query(
		collection(db, 'booking'),
		where('status', '==', 'Approved'),
		where('bookDate', '>=', currentDayTimeStamp),
		where('bookDate', '<', nextDayTimeStamp)
	);

	let isThereEvent = false;
	let isThereBooking = false;

	async function getEventsAndBookings() {
		const booksSnapshot = await getDocs(booksQuery);
		listOfBookings = booksSnapshot.docs.map((doc) => doc.data());

		const eventsSnapshot = await getDocs(eventsQuery);
		listOfEvents = eventsSnapshot.docs.map((doc) => doc.data());

		!booksSnapshot.empty ? (isThereBooking = true) : (isThereBooking = false);
		!eventsSnapshot.empty ? (isThereEvent = true) : (isThereEvent = false);
	}

	getEventsAndBookings();
</script>

<div class="p-3">
	{#if isThereBooking}
		<h1 class="font-bold text-2xl pb-8">
			Bookings for {monthName[monthNumber - 1] + ' ' + dateTitle[2] + ', ' + dateTitle[0]}
		</h1>
		{#each listOfBookings as book}
			<div class="py-5">
				<div class="bg-blue-500 rounded-lg">
					<h2 class="text-lg font-bold py-3 px-4">{book.eventTypeDisplay}</h2>
				</div>
				<p class="pt-7 px-4">
					{book.bookDate.toDate().toLocaleDateString('en-us', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					}) +
						' at ' +
						book.bookDate
							.toDate()
							.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>
		{/each}
	{/if}

	{#if isThereEvent}
		<h1 class="font-bold text-2xl pb-8">
			Events for {monthName[monthNumber - 1] + ' ' + dateTitle[2] + ', ' + dateTitle[0]}
		</h1>
		{#each listOfEvents as event}
			<div class="py-5">
				<div class="bg-blue-500 rounded-lg">
					<h2 class="text-lg font-bold py-3 px-4">{event.titleDisplay}</h2>
				</div>
				<p class="pt-7 px-4">{event.description}</p>
			</div>
		{/each}
	{/if}
</div>
