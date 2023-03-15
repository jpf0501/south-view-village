<script>
	import { getDocs, collection, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { calendarDate } from '$lib/store';
	import { getContext } from 'svelte';
	import Popup from './Popup.svelte';

	export let dayNumber;
	export let month;
	export let year;

	$: dateString = new Date(`${year}-${month}-${dayNumber}`).toLocaleDateString('fr-CA');
	$: newDateString = new Date(`${year}-${month}-${dayNumber}`);

	let isThereEvent = false;
	let isThereBooking = false;
	const { open } = getContext('simple-modal');

	async function checkIfExistingEvent(dateString) {
		const querySnapshotE = await getDocs(
			query(collection(db, 'event'), where('date', '==', dateString))
		);
		isThereEvent = !querySnapshotE.empty;
	}

	async function checkIfExistingBook(newDateString) {
		const lastDayOfMonth = new Date(year, month, 0).getDate();
		let afterDateString = new Date(`${year}-${month}-${Math.min(dayNumber + 1, lastDayOfMonth)}`);
		if (dayNumber === lastDayOfMonth) {
			// if next day is the first day of the next month
			afterDateString = new Date(`${year}-${month + 1}-01`);
		}
		if (month === 12) {
			afterDateString = new Date(`${year + 1}-01-01`);
		}
		const querySnapshotB = await getDocs(
			query(
				collection(db, 'booking'),
				where('status', '==', 'Approved'),
				where('bookDate', '>=', newDateString),
				where('bookDate', '<', afterDateString)
			)
		);
		isThereBooking = !querySnapshotB.empty;
	}

	export function showModal() {
		calendarDate.set(dateString);
		open(Popup);
	}

	$: checkIfExistingEvent(dateString);
	$: checkIfExistingBook(newDateString);
</script>

<button
	class="border border-collapse aspect-video {isThereEvent && isThereBooking
		? 'bg-red-500'
		: ''}{isThereBooking && !isThereEvent ? 'bg-blue-700 text-white' : ''} {isThereEvent &&
	!isThereBooking
		? 'bg-green-500'
		: ''}"
	on:click={showModal}
	disabled={!isThereBooking && !isThereEvent}
>
	{dayNumber}
</button>
