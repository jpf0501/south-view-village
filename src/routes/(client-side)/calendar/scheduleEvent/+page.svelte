<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';

	let user = null;
	
	let outsider = {
		name: '',
		email: '',
		contact: ''
	};

	async function getUser() {
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}
	$: if ($userStore) {
		getUser();
	}
	// $: console.log($userStore);

	function submitSchedule() {
		console.log(outsider.name);
		console.log(outsider.email);
		console.log(outsider.contact);
	}
</script>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl mt-2">Schedule an Event</h1>
		<form on:submit|preventDefault={submitSchedule}>
			{#if user}
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<h1 class="border-2 rounded-lg p-3 mt-2">{user.firstname} {user.lastname}</h1>
					</div>
					<div class="form-control ">
						<span class="label-text">E-mail Address</span>
						<h1 class="border-2 rounded-lg p-3 mt-2">{user.email}</h1>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<h1 class="border-2 rounded-lg p-3 mt-2">{user.contactNumber}</h1>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<input type="text" bind:value={outsider.name} class="input input-bordered" />
					</div>
					<div class="form-control ">
						<span class="label-text">E-mail Address</span>
						<input
							type="email"
							bind:value={outsider.email}
							name="email"
							class="input input-bordered"
							required
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<input
							type="number"
							bind:value={outsider.contact}
							name="contact"
							class="input input-bordered"
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
