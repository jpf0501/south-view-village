<script>
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

	let empty = {};

	let guest = {
		firstname: '',
		lastname: '',
		email: '',
		contactNumber: '',
		status: 'Pending',
		paymentStatus: 'Unpaid',
		eventType: '',
		date: '',
		time: '',
		dateReserved: serverTimestamp()
	};

	async function submitHandler() {
		const regex = /^[a-zA-Z -]*$/;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		empty = {
			email: !guest.email,
			firstname: !guest.firstname,
			lastname: !guest.lastname,
			contactNumber: !guest.contactNumber,
			eventType: !guest.eventType,
			time: !guest.time,
			date: !guest.date,
			invalidFirstname: !regex.test(guest.firstname),
			invalidLastname: !regex.test(guest.lastname),
			invalidEmail: !emailRegex.test(guest.email)
		};

		if (Object.values(empty).some((v) => v)) {
			setTimeout(() => {
				empty = {};
			}, 2000);
			return;
		}
		try {
			await addDoc(collection(db, 'booking'), {
				firstname: guest.firstname.trim().toLowerCase(),
				firstNameDisplay: guest.firstname,
				lastname: guest.lastname.trim().toLowerCase(),
				lastNameDisplay: guest.lastname,
				email: guest.email.trim().toLowerCase(),
				contactNumber: guest.contactNumber,
				status: guest.status,
				paymentStatus: guest.paymentStatus,
				eventType: guest.eventType.trim().toLowerCase(),
				eventTypeDisplay: guest.eventType,
				bookDate: new Date(guest.date + ' ' + guest.time),
				dateReserved: guest.dateReserved,
				dateReviewed: guest.dateReserved
			});
			toast.success('Reservation submitted!');
			await goto('/calendar');
		} catch (error) {
			console.log(error);
			toast.error('Error in submitting reservation!');
		}
	}
</script>

<svelte:head>
	<title>Add Reservation - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Clubhouse Reservation Form</h1>
		<form on:submit|preventDefault={submitHandler}>
			<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
				<div class="form-control">
					<span class="label-text">First Name</span>
					{#if empty.firstname}
						<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
					{:else if empty.invalidFirstname}
						<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
					{/if}
					<input
						type="text"
						bind:value={guest.firstname}
						class="input input-bordered p-3 mt-2"
						placeholder="Juan"
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Last Name</span>
					{#if empty.lastname}
						<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
					{:else if empty.invalidLastname}
						<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
					{/if}
					<input
						type="text"
						bind:value={guest.lastname}
						class="input input-bordered p-3 mt-2"
						placeholder="Dela Cruz"
					/>
				</div>
				<div class="form-control">
					<span class="label-text">E-mail Address</span>
					{#if empty.email}
						<p class="text-red-500 text-sm italic mb-1">Email is required</p>
					{:else if empty.invalidEmail}
						<p class="text-red-500 text-sm italic mb-1">Invalid email</p>
					{/if}
					<input
						type="text"
						bind:value={guest.email}
						name="email"
						class="input input-bordered p-3 mt-2"
						placeholder="juandelacruz@gmail.com"
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Contact No.</span>
					{#if empty.contactNumber}
						<p class="text-red-500 text-sm italic mb-1">Contact number is required</p>
					{/if}
					<input
						type="tel"
						onkeypress="return event.charCode >= 48 && event.charCode <= 57"
						minlength="11"
						maxlength="11"
						placeholder="09123456789"
						pattern={String.raw`^(09)\d{9}$`}
						bind:value={guest.contactNumber}
						name="contact"
						class="input input-bordered p-3 mt-2"
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Type of Event</span>
					{#if empty.eventType}
						<p class="text-red-500 text-sm italic mb-1">Event type is required</p>
					{/if}
					<input
						type="text"
						class="input input-bordered p-3 mt-2"
						bind:value={guest.eventType}
						placeholder="Birthday"
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Date</span>
					{#if empty.date}
						<p class="text-red-500 text-sm italic mb-1">Date is required</p>
					{/if}
					<input
						type="date"
						min={dateMin}
						max={dateMax}
						class="input input-bordered p-3 mt-2"
						bind:value={guest.date}
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Time</span>
					{#if empty.time}
						<p class="text-red-500 text-sm italic mb-1">Time is required</p>
					{/if}
					<input
						type="time"
						min="8:00"
						max="19:00"
						class="input input-bordered p-3 mt-2"
						bind:value={guest.time}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button type="submit" class="btn btn-primary">Submit Schedule</button>
				<button type="reset" class="btn btn-error mx-1 text-white">Clear Input</button>
			</div>
		</form>
	</div>
</div>
