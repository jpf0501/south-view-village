<script>
	import { userStore } from '$lib/store';
	import {
		getDoc,
		doc,
		addDoc,
		collection,
		serverTimestamp,
		query,
		where,
		getDocs
	} from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';

	const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

	let user = null;
	let errors = {};
	let OTP = '';
	let userOTP = '';
	let showOTP = false;
	let extraEmail = '';

	let bookData = {
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

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
		user.firstname = user.firstNameDisplay;
		user.lastname = user.lastNameDisplay;
		extraEmail = user.email;
	}

	async function submitHandler() {
		if (user) {
			bookData.firstname = user.firstname;
			bookData.lastname = user.lastname;
			bookData.email = user.email;
			bookData.contactNumber = user.contactNumber;
		}
		try {
			const isValid = await checkInput();
			if (!isValid) {
				toast.error('Form validation failed');
				return;
			}
			if (user && user.email === extraEmail) {
				submitToAdmin();
			} else {
				await sendOTP();
			}
		} catch (error) {
			console.log('Error during submission', error);
			toast.error('Error during submission');
		}
	}

	async function checkInput() {
		// letter and '-'
		const regex = /^[a-zA-Z -]*$/;
		// must ba an email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// must have at least 1 letter
		const firstnameRegex = bookData.firstname.length > 0 && /[a-zA-Z]/.test(bookData.firstname);
		const lastnameRegex = bookData.lastname.length > 0 && /[a-zA-Z]/.test(bookData.lastname);

		let eventCurrentTimeStamp = new Date(bookData.date);
		eventCurrentTimeStamp.setHours(0);
		eventCurrentTimeStamp.setMinutes(0);
		eventCurrentTimeStamp.setSeconds(0);

		let eventTommorowTimeStamp = new Date(bookData.date);
		eventTommorowTimeStamp.setHours(0);
		eventTommorowTimeStamp.setMinutes(0);
		eventTommorowTimeStamp.setSeconds(0);
		// computation to get the next day of guess.date in a date type
		let eventYear = eventTommorowTimeStamp.getFullYear();
		let eventMonth = eventTommorowTimeStamp.getMonth();
		let lastDayOfMonth = new Date(eventYear, eventMonth + 1, 0).getDate();
		if (eventTommorowTimeStamp.getDate() === lastDayOfMonth) {
			eventMonth++;
			eventTommorowTimeStamp.setMonth(eventMonth);
			eventTommorowTimeStamp.setDate(1);
			if (eventMonth === 12) {
				eventYear++;
				eventTommorowTimeStamp.setFullYear(eventYear);
			}
		} else {
			eventTommorowTimeStamp.setDate(eventTommorowTimeStamp.getDate() + 1);
		}
		// console.log(eventCurrentTimeStamp);
		// console.log(eventTommorowTimeStamp);
		const bookingsQuery = query(
			collection(db, 'booking'),
			where('bookDate', '>=', eventCurrentTimeStamp),
			where('bookDate', '<', eventTommorowTimeStamp)
		);
		const bookingsSnapshot = await getDocs(bookingsQuery);

		errors = {
			email: !bookData.email,
			firstname: !bookData.firstname,
			lastname: !bookData.lastname,
			contactNumber: !bookData.contactNumber,
			eventType: !bookData.eventType,
			time: !bookData.time,
			date: !bookData.date,
			invalidFirstname: !regex.test(bookData.firstname),
			invalidLastname: !regex.test(bookData.lastname),
			invalidFirstnameRequired: !firstnameRegex,
			invalidLastnameRequired: !lastnameRegex,
			invalidEmail: !emailRegex.test(bookData.email),
			dateIsReserved: bookingsSnapshot.docs.length > 0
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function sendOTP() {
		const digits = '0123456789';
		OTP = '';
		OTP = Array.from({ length: 6 }, () => digits[Math.floor(Math.random() * digits.length)]).join(
			''
		);
		try {
			await sendEmail({
				to: bookData.email,
				subject: 'Your OTP code',
				html: `<h1>Your OTP is: ${OTP}</h1>`
			});
			showOTP = true;
			toast.success('OTP sent');
		} catch (error) {
			console.error(error);
			toast.error('Error in sending OTP');
		}
	}

	async function confirmOTP() {
		if (!userOTP) return toast.error('OTP required');
		if (userOTP !== OTP) return toast.error('Incorrect OTP');
		await submitToAdmin();
	}

	async function submitToAdmin() {
		const bookingData = {
			firstname: bookData.firstname.trim().toLowerCase(),
			firstNameDisplay: bookData.firstname.trim(),
			lastname: bookData.lastname.trim().toLowerCase(),
			lastNameDisplay: bookData.lastname.trim(),
			email: bookData.email.trim(),
			contactNumber: bookData.contactNumber,
			status: bookData.status,
			paymentStatus: bookData.paymentStatus,
			eventType: bookData.eventType.trim().toLowerCase(),
			eventTypeDisplay: bookData.eventType,
			bookDate: new Date(bookData.date + ' ' + bookData.time),
			dateReserved: bookData.dateReserved,
			dateReviewed: bookData.dateReserved
		};

		try {
			await addDoc(collection(db, 'booking'), bookingData);
			toast.success('Reservation submitted!');
			await goto('/calendar');
			showOTP = false;
		} catch (error) {
			console.log(error);
			toast.error('Error in submitting reservation!');
		}
	}

	$: if ($userStore) {
		getUser();
	}
</script>

<svelte:head>
	<title>Clubhouse Reservation - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

{#if showOTP}
	<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
		<div class="bg-white rounded-lg shadow-lg p-8 w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
			<h2 class="text-2xl font-bold mb-4 text-center">Enter OTP</h2>
			<form class="mb-4 flex flex-col items-center" on:submit|preventDefault={confirmOTP}>
				<div class="w-full mb-4">
					<label class="block text-gray-700 font-bold mb-2" for="otp">OTP</label>
					<input
						class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						type="text"
						placeholder="Enter OTP"
						autocomplete="off"
						maxlength="6"
						bind:value={userOTP}
					/>
				</div>
				<div class="w-full flex flex-col md:flex-row items-center justify-between">
					<button
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:mr-2"
						type="submit">Submit</button
					>
					<button
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:mr-2"
						type="button"
						on:click={submitHandler}>Resend OTP</button
					>
					<button
						class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						type="button"
						on:click={() => (showOTP = false)}>Cancel</button
					>
				</div>
			</form>
		</div>
	</div>
{:else}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl mt-2">Clubhouse Reservation Form</h1>
			<form on:submit|preventDefault={submitHandler}>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					{#if user}
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
								class="input input-bordered p-3 mt-2"
								bind:value={user.firstname}
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
								class="input input-bordered p-3 mt-2"
								bind:value={user.lastname}
								placeholder="Dela Cruz"
							/>
						</div>
						<div class="form-control ">
							<span class="label-text">E-mail Address</span>
							{#if errors.email}
								<p class="text-red-500 text-sm italic mb-1">Email is required</p>
							{:else if errors.invalidEmail}
								<p class="text-red-500 text-sm italic mb-1">Invalid email</p>
							{/if}
							<input
								type="text"
								class="input input-bordered p-3 mt-2"
								bind:value={user.email}
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
								class="input input-bordered p-3 mt-2"
								bind:value={user.contactNumber}
							/>
						</div>
					{:else}
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
								bind:value={bookData.firstname}
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
								bind:value={bookData.lastname}
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
								bind:value={bookData.email}
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
								bind:value={bookData.contactNumber}
								name="contact"
								class="input input-bordered p-3 mt-2"
							/>
						</div>
					{/if}
					<div class="form-control">
						<span class="label-text">Type of Event</span>
						{#if errors.eventType}
							<p class="text-red-500 text-sm italic mb-1">Event type is required</p>
						{/if}
						<input
							type="text"
							class="input input-bordered p-3 mt-2"
							bind:value={bookData.eventType}
							placeholder="Birthday"
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Date</span>
						{#if errors.date}
							<p class="text-red-500 text-sm italic mb-1">Date is required</p>
						{:else if errors.dateIsReserved}
							<p class="text-red-500 text-sm italic mb-1">That date is already reserved</p>
						{/if}
						<input
							type="date"
							min={dateMin}
							max={dateMax}
							class="input input-bordered p-3 mt-2"
							bind:value={bookData.date}
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Time</span>
						{#if errors.time}
							<p class="text-red-500 text-sm italic mb-1">Time is required</p>
						{/if}
						<input
							type="time"
							min="8:00"
							max="19:00"
							class="input input-bordered p-3 mt-2"
							bind:value={bookData.time}
						/>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary">Submit Schedule</button>
				</div>
			</form>
		</div>
	</div>
{/if}
