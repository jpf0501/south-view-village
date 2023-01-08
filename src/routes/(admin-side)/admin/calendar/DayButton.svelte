<script>
	import { getDocs, collection, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';

	export let dayNumber;
	export let month;
	export let year;

	$: dateString = new Date(`${year}-${month}-${dayNumber}`).toLocaleDateString('en-CA');

	let isThereEvent = false;

	async function checkIfExistingEvent(dateString) {
		const querySnapshot = await getDocs(
			query(collection(db, 'event'), where('date', '==', dateString))
		);
		isThereEvent = !querySnapshot.empty;
	}

	$: checkIfExistingEvent(dateString);
</script>

<button
	class="border border-collapse aspect-video"
	on:click={() => alert('Hello')}
	disabled={!isThereEvent}
	class:bg-red-500={isThereEvent}
>
	{dayNumber}
</button>
