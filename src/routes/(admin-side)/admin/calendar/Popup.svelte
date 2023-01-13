<script>
	import { onSnapshot, query, collection, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { calendarDate } from '$lib/store';
	import { onDestroy } from 'svelte';

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

	let listOfEvents = [];
	let eventsQuery = query(collection(db, 'event'), where('date', '==', $calendarDate));
	let dateTitle = $calendarDate.split('-');
	let monthNumber = dateTitle[1];

	async function getEvents(eventsQuery) {
		const unsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
			listOfEvents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	$: getEvents(eventsQuery);
</script>

<div class="p-3">
	<h1 class="font-bold text-2xl pb-8">Events for {monthName[monthNumber - 1] + ' ' + dateTitle[2] + ', ' + dateTitle[0]}</h1>
	{#each listOfEvents as event}
		<div class="py-5">
			<div class="bg-blue-500 rounded-lg">
				<h2 class="text-lg font-bold py-3 px-4">{event.titleDisplay}</h2>
			</div>
			<p class="pt-7 px-4">{event.description}</p>
		</div>
	{/each}
</div>
