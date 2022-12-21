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

{#if user}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Account Profile</h1>
			</div>
			<form>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">Name</span>
						<h1>{user.firstname} {user.lastname}</h1>
						<!-- <input type="text" bind:value={user.firstname} name="fname" class="input input-bordered" disabled/> -->
					</div>
					<div class="form-control">
						<span class="label-text">Address</span>
						<h1>Block {user.addressBlock} Lot {user.addressLot} {user.addressStreet} Street</h1>
						<!-- <input type="text" bind:value={user.lastname} name="lname" class="input input-bordered" disabled/> -->
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<span class="label-text">E-mail Address</span>
						<h1>{user.email}</h1>
						<!-- <input type="text" placeholder="juandelacruz@gmail.com" name="email" class="input input-bordered" required/> -->
					</div>
					<div class="form-control">
						<span class="label-text">Contact No.</span>
						<h1>{user.contactNumber}</h1>
						<!-- <input type="tel" placeholder="09123456789" name="contact" class="input input-bordered" required/> -->
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<a href="/profile/edit" class="btn btn-primary mx-1">Edit Info</a>
				</div>
			</form>
		</div>
	</div>
{/if}
