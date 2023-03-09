<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';

	let user = null;
	const dateMin = new Date(Date.now() + 8.64e7).toLocaleDateString('en-ca');
	const dateMax = new Date(Date.now() + 8.64e7 + 6.048e8 * 2).toLocaleDateString('en-ca');

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

	let empty = {};
	let showOTP = false;
	let userOTP = '';
	let OTP = '';

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
		user.firstname = user.firstNameDisplay;
		user.lastname = user.lastNameDisplay;
	}
	$: if ($userStore) {
		getUser();
	}

	async function sendOTP() {
		const regex = /^[a-zA-Z -]*$/;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		let data = user || guest;

		empty = {
			email: !data.email,
			firstname: !data.firstname,
			lastname: !data.lastname,
			contactNumber: !data.contactNumber,
			eventType: !guest.eventType,
			time: !guest.time,
			date: !guest.date,
			invalidFirstname: !regex.test(data.firstname),
			invalidLastname: !regex.test(data.lastname),
			invalidEmail: !emailRegex.test(data.email)
		};

		if (Object.values(empty).some((v) => v)) {
			setTimeout(() => {
				empty = {};
			}, 2000);
			return;
		}
		let OTP = '';
		for (let i = 0; i < 6; i++) {
			OTP += Math.floor(Math.random() * 10);
		}
		try {
			await sendEmail({
				to: data.email,
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
		if (!userOTP) {
			toast.error('OTP required');
			return;
		}
		if (userOTP !== OTP) {
			toast.error('Incorrect OTP');
			return;
		}
		if (user !== null) {
			try {
				await addDoc(collection(db, 'booking'), {
					firstname: guest.firstname.trim().toLowerCase(),
					firstNameDisplay: guest.firstname,
					lastname: guest.lastname.trim().toLowerCase(),
					lastNameDisplay: guest.lastname,
					email: user.email.trim().toLowerCase(),
					contactNumber: user.contactNumber,
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
		} else {
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
				toast.success('Reservation Form Submitted!');
				await goto('/calendar');
				showOTP = false;
			} catch (error) {
				console.log(error);
				toast.error('Error in Submitting Reservation!');
			}
		}
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
						on:click={sendOTP}>Resend OTP</button
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
			<form on:submit|preventDefault={sendOTP}>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					{#if user}
						<div class="form-control">
							<span class="label-text">First Name</span>
							{#if empty.firstname}
								<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
							{:else if empty.invalidFirstname}
								<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
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
							{#if empty.lastname}
								<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
							{:else if empty.invalidLastname}
								<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
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
							{#if empty.email}
								<p class="text-red-500 text-sm italic mb-1">Email is required</p>
							{:else if empty.invalidEmail}
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
								class="input input-bordered p-3 mt-2"
								bind:value={user.contactNumber}
							/>
						</div>
					{:else}
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
					{/if}
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
{/if}
