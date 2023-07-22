<script>
	import { addDoc, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../lib/Components/Confirmation.svelte';

	// const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	// const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

	let event = {
		title: '',
		date: '',
		description: ''
	};

	let errors = {};
	let confirmation = false;
	let confirmationText;

	async function handleSubmit() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		confirmationText = `Do you want to create event "${event.title}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		await addEvent()
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function checkInput() {
		errors = {
			title: !event.title,
			description: !event.description,
			date: !event.date,
			descriptionKulang: event.description.length < 11
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function addEvent() {
		try {
			await addDoc(collection(db, 'event'), {
				title: event.title.trim().toLowerCase(),
				titleDisplay: event.title.trim(),
				description: event.description.trim(),
				date: event.date
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

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Add Event Form</h1>
		<form>
			<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
				<div class="form-control">
					<span class="pb-3">Event Title</span>
					{#if errors.title}
						<p class="text-red-500 text-sm italic mb-1">Event title is required</p>
					{/if}
					<input
						type="text"
						class="input input-bordered p-3 mt-2"
						bind:value={event.title}
					/>
				</div>
				<div class="form-control">
					<span class="pb-3">Event Date</span>
					{#if errors.date}
						<p class="text-red-500 text-sm italic mb-1">Event Date is required</p>
					{/if}
					<input
						type="date"
						class="input input-bordered p-3 mt-2"
						bind:value={event.date}
					/>
				</div>
			</div>
			<div class="mt-6">
				<div class="form-control">
					<span class="pb-3">Event Desciption</span>
					{#if errors.description}
						<p class="text-red-500 text-sm italic mb-1">Event description is required</p>
						{:else if errors.descriptionKulang}
						<p class="text-red-500 text-sm italic mb-1">Description must be at least 10 characters</p>
					{/if}
					<textarea
						class="h-60 textarea textarea-bordered p-3"
						style="white-space:pre-wrap; resize:none"
						bind:value={event.description}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button on:click={handleSubmit} type="button" class="btn btn-primary">Add Event</button>
				<a href="/admin/calendar" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
