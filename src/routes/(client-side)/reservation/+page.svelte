<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc, addDoc, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';

	let user = null;

	let guest = {
		firstname: '',
		lastname: '',
		email: '',
		contactNumber: '',
		status: 'Pending',
		eventType: '',
		date: '',
		time: ''
	};

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}
	$: if ($userStore) {
		getUser();
	}

	async function submitHandler() {
		if (user != null) {
			try {
				await addDoc(collection(db, 'booking'), {
					firstName: user.firstname,
					lastName: user.lastname,
					email: user.email,
					contactNumber: user.contactNumber,
					status: guest.status,
					eventType: guest.eventType,
					date: guest.date,
					time: guest.time
				});
				alert('Reservation form submitted');
				await goto('/');
			} catch (error) {
				console.log(error);
				alert('Error sending request');
			}
		} else {
			try {
				await addDoc(collection(db, 'booking'), {
					firstName: guest.firstname,
					lastName: guest.lastname,
					email: guest.email,
					contactNumber: guest.contactNumber,
					status: guest.status,
					eventType: guest.eventType,
					date: guest.date,
					time: guest.time
				});
				alert('Schedule request submitted');
				await goto('/calendar');
			} catch (error) {
				console.log(error);
				alert('Error sending request');
			}
		}
	}
</script>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Clubhouse Reservation Form</h1>
		<form on:submit|preventDefault={submitHandler}>
			{#if user}
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">First Name</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={user.firstname}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Last Name</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={user.lastname}
							required
						/>
					</div>
					<div class="form-control ">
						<span class="label-text">E-mail Address</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={user.email}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={user.contactNumber}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Type of Event</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.eventType}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Date</span>
						<input
							type="date"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.date}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Time</span>
						<input
							type="time"
							min="8:00"
							max="19:00"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.time}
							required
						/>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">First Name</span>
						<input
							type="text"
							bind:value={guest.firstname}
							class="border-2 rounded-lg p-3 mt-2"
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Last Name</span>
						<input
							type="text"
							bind:value={guest.lastname}
							class="border-2 rounded-lg p-3 mt-2"
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">E-mail Address</span>
						<input
							type="email"
							bind:value={guest.email}
							name="email"
							class="border-2 rounded-lg p-3 mt-2"
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<input
							type="text"
							bind:value={guest.contactNumber}
							name="email"
							class="border-2 rounded-lg p-3 mt-2"
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Type of Event</span>
						<input
							type="text"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.eventType}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Date</span>
						<input
							type="date"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.date}
							required
						/>
					</div>
					<div class="form-control">
						<span class="label-text">Time</span>
						<input
							type="time"
							min="8:00"
							max="19:00"
							class="border-2 rounded-lg p-3 mt-2"
							bind:value={guest.time}
							required
						/>
					</div>
				</div>
			{/if}

			<div class="flex justify-end mt-8">
				<button type="submit" class="btn btn-primary">Submit Schedule</button>
				<a href="/calendar" class="btn btn-error mx-1">Cancel</a>
			</div>
		</form>
	</div>
</div>
