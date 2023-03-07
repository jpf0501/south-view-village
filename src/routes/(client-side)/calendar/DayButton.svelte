<script>
	import { getDocs, collection, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { calendarDate } from '$lib/store'
	import { getContext } from 'svelte';
	import Popup from './Popup.svelte';

	export let dayNumber;
	export let month;
	export let year;

	$: dateString = new Date(`${year}-${month}-${dayNumber}`).toLocaleDateString('fr-CA');
	
	let isThereEvent = false;
	const { open } = getContext('simple-modal');
	// const showModal = () => open(Popup);

	async function checkIfExistingEvent(dateString) {
		const querySnapshot = await getDocs(
			query(collection(db, 'event'), where('date', '==', dateString))
		);
		isThereEvent = !querySnapshot.empty;
	}

	export function showModal() {
		calendarDate.set(dateString)
		open(Popup);
	}
	
	$: checkIfExistingEvent(dateString);
</script>

<button
    class="border border-collapse aspect-video {isThereEvent ? 'bg-blue-700 text-white' : ''}"
    on:click={showModal}
    disabled={!isThereEvent}
>
	{dayNumber}
</button>
