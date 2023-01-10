<script>
    import { onSnapshot, query, collection, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
    import { calendarDate } from '$lib/store';
	import { onDestroy } from 'svelte';

    let listOfEvents = [];
    let eventsQuery = query(collection(db, 'event'), where('date', '==', $calendarDate));

    async function getEvents(eventsQuery) {
		const unsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
			listOfEvents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

    $: getEvents(eventsQuery);
</script>


<div>
    <h1 class="font-bold text-xl pb-4">Events for {$calendarDate}</h1>
    {#each listOfEvents as event}
    <div class="p-3">
        <h2 class="font-bold">{event.title}</h2>
        <p class="p-2">{event.description}</p>
    </div>
    {/each}
</div>
