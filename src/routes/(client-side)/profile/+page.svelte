<script>
	import { userStore } from '$lib/store';
	import { getDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { goto } from '$app/navigation';

	let user = null;

	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}
	$: if ($userStore) {
		getUser();
	} else if ($userStore === null) {
		goto('/');
	}
	// $: console.log($userStore);
</script>

<svelte:head>
	<title>Profile - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

{#if user}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl mt-2 pb-5">Account Profile</h1>
			<div>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<h1 class="p-3 mt-2">{user.firstNameDisplay} {user.middleNameDisplay} {user.lastNameDisplay}</h1>
						<!-- <input type="text" bind:value={user.firstname} name="fname" class="input input-bordered" disabled/> -->
					</div>
					<div class="form-control ">
						<span class="label-text">Address</span>
						<h1 class="p-3 mt-2">
							Block {user.addressBlock} Lot {user.addressLot}
							{user.addressStreet} Street
						</h1>
						<!-- <input type="text" bind:value={user.lastname} name="lname" class="input input-bordered" disabled/> -->
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">E-mail Address</span>
						<h1 class="p-3 mt-2">{user.email}</h1>
						<!-- <input type="text" placeholder="juandelacruz@gmail.com" name="email" class="input input-bordered" required/> -->
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<h1 class="p-3 mt-2">{user.contactNumber}</h1>
						<!-- <input type="tel" placeholder="09123456789" name="contact" class="input input-bordered" required/> -->
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<a href="/profile/edit" class="btn btn-primary mx-1"
						>Edit Info</a
					>
				</div>
			</div>
		</div>
	</div>
{/if}
