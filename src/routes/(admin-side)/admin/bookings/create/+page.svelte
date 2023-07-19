<script>
	import { addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	// // const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

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
		endTime: '',
		dateReserved: serverTimestamp()
	};
	let errors = {};

	async function submitHandler() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		createBookings();
	}

	async function checkInput() {
		const regex = /^[a-zA-Z -]*$/;
		// must have at least 1 letter
		const firstnameRegex = guest.firstname.length > 0 && /[a-zA-Z]/.test(guest.firstname);
		const lastnameRegex = guest.lastname.length > 0 && /[a-zA-Z]/.test(guest.lastname);
		// must ba an email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// let eventCurrentTimeStamp = new Date(guest.date);
		// eventCurrentTimeStamp.setHours(0);
		// eventCurrentTimeStamp.setMinutes(0);
		// eventCurrentTimeStamp.setSeconds(0);

		// let eventTommorowTimeStamp = new Date(guest.date);
		// eventTommorowTimeStamp.setHours(0);
		// eventTommorowTimeStamp.setMinutes(0);
		// eventTommorowTimeStamp.setSeconds(0);
		// computation to get the next day of guess.date in a date type
		// let eventYear = eventTommorowTimeStamp.getFullYear();
		// let eventMonth = eventTommorowTimeStamp.getMonth();
		// let lastDayOfMonth = new Date(eventYear, eventMonth + 1, 0).getDate();
		// if (eventTommorowTimeStamp.getDate() === lastDayOfMonth) {
		// 	eventMonth++;
		// 	eventTommorowTimeStamp.setMonth(eventMonth);
		// 	eventTommorowTimeStamp.setDate(1);
		// 	if (eventMonth === 12) {
		// 		eventYear++;
		// 		eventTommorowTimeStamp.setFullYear(eventYear);
		// 	}
		// } else {
		// 	eventTommorowTimeStamp.setDate(eventTommorowTimeStamp.getDate() + 1);
		// }
		// console.log(eventCurrentTimeStamp);
		// console.log(eventTommorowTimeStamp);
		// const bookingsQuery = query(
		// 	collection(db, 'booking'),
		// 	where('bookDate', '>=', eventCurrentTimeStamp),
		// 	where('bookDate', '<', eventTommorowTimeStamp)
		// );
		// const bookingsSnapshot = await getDocs(bookingsQuery);
		errors = {
			email: !guest.email,
			firstname: !guest.firstname,
			lastname: !guest.lastname,
			contactNumber: !guest.contactNumber,
			eventType: !guest.eventType,
			time: !guest.time,
			endTime: !guest.endTime,
			date: !guest.date,
			invalidFirstname: !regex.test(guest.firstname),
			invalidLastname: !regex.test(guest.lastname),
			invalidFirstnameRequired: !firstnameRegex,
			invalidLastnameRequired: !lastnameRegex,
			invalidEmail: !emailRegex.test(guest.email),
			// dateIsReserved: bookingsSnapshot.docs.length > 0
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function createBookings() {
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
				endTime: guest.endTime,
				dateReserved: guest.dateReserved,
				dateReviewed: guest.dateReserved,
				isRescheduled: false
			});
			toast.success('Reservation entry saved!');
			await goto('/admin/bookings');
		} catch (error) {
			console.log(error);
			toast.error('Error in saving entry!');
		}
	}
</script>

<svelte:head>
	<title>Add Reservation Form - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Add Reservation Entry Form</h1>
		<form on:submit|preventDefault={submitHandler}>
			<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
				<div class="form-control">
					<span class="label-text">First Name</span>
					{#if errors.firstname}
						<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
					{:else if errors.invalidFirstname}
						<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
					{:else if errors.invalidFirstnameRequired}
						<p class="text-red-500 text-sm italic mb-1">Firstname must have a letter</p>
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
					{#if errors.lastname}
						<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
					{:else if errors.invalidLastname}
						<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
					{:else if errors.invalidLastnameRequired}
						<p class="text-red-500 text-sm italic mb-1">Lastname must have a letter</p>
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
					{#if errors.email}
						<p class="text-red-500 text-sm italic mb-1">Email is required</p>
					{:else if errors.invalidEmail}
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
					{#if errors.contactNumber}
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
					{#if errors.eventType}
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
					{#if errors.date}
						<p class="text-red-500 text-sm italic mb-1">Date is required</p>
					<!-- {:else if errors.dateIsReserved}
						<p class="text-red-500 text-sm italic mb-1">That date is already reserved</p> -->
					{/if}
					<input
						type="date"
						class="input input-bordered p-3 mt-2"
						min={dateMin}
						bind:value={guest.date}
					/>
				</div>
				<div class="form-control">
					<span class="label-text">Start Time</span>
					{#if errors.time}
						<p class="text-red-500 text-sm italic mb-1">Start time is required</p>
					{/if}
					<input
						type="time"
						min="8:00"
						max="19:00"
						class="input input-bordered p-3 mt-2"
						bind:value={guest.time}
					/>
				</div>
				<div class="form-control">
					<span class="label-text">End Time</span>
					{#if errors.endTime}
						<p class="text-red-500 text-sm italic mb-1">End time is required</p>
					{/if}
					<input
						type="time"
						min="8:00"
						max="19:00"
						class="input input-bordered p-3 mt-2"
						bind:value={guest.endTime}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button type="submit" class="btn btn-primary">Add Entry</button>
				<a href="/admin/bookings" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
