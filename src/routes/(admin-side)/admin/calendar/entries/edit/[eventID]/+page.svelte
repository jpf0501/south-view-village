<script>
    import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
	import { goto } from '$app/navigation';

    /** @type {import('./$types').PageData} */
	export let data;
	const { eventID } = data;

    let event = null;

    async function getEvent() {
		const snapshot = await getDoc(doc(db, 'event', eventID));
		event = snapshot.data();
        event.title = event.titleDisplay;
	}
	getEvent();

	async function updateEvent() {
		event.title = event.titleDisplay.toLowerCase();
		try {
			await updateDoc(doc(db, 'event', eventID), event);
			alert('Event details updated');
			await goto('/admin/calendar/entries/');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}

	async function deleteEvent() {
		try {
			await deleteDoc(doc(db, 'event', eventID), event);
			alert('Event deleted');
			await goto('/admin/calendar/entries/');
		} catch (error) {
			console.log(error);
			alert('Error deleting');
		}
	}

</script>

<svelte:head>
	<title>Edit Event - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if event}
<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Edit Event</h1>
			<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
				<div class="form-control">
					<span class="pb-3">Event Title</span>
					<input
						type="text"
						class="input input-bordered p-3 mt-2"
						bind:value={event.titleDisplay}
						required
					/>
				</div>
				<div class="form-control">
					<span class="pb-3">Event Date</span>
					<input
						type="date"
						class="input input-bordered p-3 mt-2"
						bind:value={event.date}
						required
					/>
				</div>
			</div>
			<div class="mt-6">
				<div class="form-control">
					<span class="pb-3">Event Desciption</span>
					<textarea
						class="h-60 textarea textarea-bordered p-3"
						style="white-space:pre-wrap; resize:none"
						required
						bind:value={event.description}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button type="submit" on:click={updateEvent} class="btn btn-primary">Save</button>
				<a href="/admin/calendar/entries/" class="btn btn-error mx-1 text-white">Cancel</a>
                <button type="submit" on:click={deleteEvent} class="btn btn-warning text-white">Delete</button>
			</div>
	</div>
</div>
{/if}