<script>
	import { addDoc, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	// const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	// const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

	let event = {
		eventTitle: '',
		eventDate: '',
		eventDescription: ''
	};

	async function submitHandler() {
		try {
			await addDoc(collection(db, 'event'), {
				title: event.eventTitle.trim().toLowerCase(),
				titleDisplay: event.eventTitle.trim(),
				description: event.eventDescription.trim(),
				date: event.eventDate
			});
			toast.success('Event added!');
			await goto('/admin/calendar');
		} catch (error) {
			console.log(error);
			toast.error('Error in adding an event!');
		}
	}
</script>

<svelte:head>
	<title>Add Event - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Add Event Form</h1>
		<form on:submit|preventDefault={submitHandler}>
			<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
				<div class="form-control">
					<span class="pb-3">Event Title</span>
					<input
						type="text"
						class="input input-bordered p-3 mt-2"
						bind:value={event.eventTitle}
						required
					/>
				</div>
				<div class="form-control">
					<span class="pb-3">Event Date</span>
					<input
						type="date"
						class="input input-bordered p-3 mt-2"
						bind:value={event.eventDate}
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
						bind:value={event.eventDescription}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button type="submit" class="btn btn-primary">Submit Event</button>
				<a href="/admin/calendar" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
