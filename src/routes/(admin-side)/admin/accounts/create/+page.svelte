<script>
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import { onSnapshot, query, collection, orderBy } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import toast from 'svelte-french-toast';

	let account = {
		email: '',
		password: '',
		passwordcheck: '',
		firstname: '',
		lastname: '',
		addressBlock: '',
		addressLot: '',
		addressStreet: '',
		contactNumber: '',
		role: '',
		paymentHead: '',
		paymentStatus: 'Unpaid'
	};
	let streetQuery = query(collection(db, 'street'), orderBy('streetName', 'asc'));
	let listOfStreets = [];

	const blockValue = Array.from({ length: 23 }, (_, i) => ({
		value: i + 1
	}));

	const lotValue = Array.from({ length: 26 }, (_, i) => ({
		value: i + 1
	}));

	async function getStreet() {
		const unsubscribe = onSnapshot(streetQuery, (querySnapshot) => {
			listOfStreets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		});
		onDestroy(() => unsubscribe());
	}

	async function submitHandler() {
		try {
			if (account.password != account.passwordcheck) {
				throw 'Passwords do not match';
			}
			const response = await fetch('/api/accounts', {
				method: 'POST',
				body: JSON.stringify({
					email: account.email,
					password: account.password,
					firstname: account.firstname.trim().toLowerCase(),
					firstNameDisplay: account.firstname,
					lastname: account.lastname.trim().toLowerCase(),
					lastNameDisplay: account.lastname,
					addressBlock: account.addressBlock,
					addressLot: account.addressLot,
					addressStreet: account.addressStreet,
					contactNumber: account.contactNumber,
					role: account.role,
					paymentHead: account.paymentHead,
					paymentStatus: account.paymentStatus
				})
			});
			const result = await response.json();
			console.log(result);
			toast.success('Account created!');
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			toast.error('Error in creating an account!');
		}
	}

	$: getStreet(streetQuery);
</script>

<svelte:head>
	<title>Create Account - Southview Homes 3 Admin Panel</title>
</svelte:head>

<main>
	<div class="min-h-screen hero bg-base-200 py-8">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<div class="mt-2">
				<h1 class="text-2xl">Create Account</h1>
			</div>
			<form on:submit|preventDefault={submitHandler}>
				<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">First Name</span>
						</label>
						<input
							type="text"
							placeholder="Juan"
							name="fname"
							class="input input-bordered"
							required
							bind:value={account.firstname}
						/>
					</div>
					<div class="form-control">
						<label for="lname" class="label">
							<span class="label-text">Last Name</span>
						</label>
						<input
							type="text"
							placeholder="Dela Cruz"
							name="lname"
							class="input input-bordered"
							required
							bind:value={account.lastname}
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						<select
							class="select select-bordered w-full"
							required
							bind:value={account.addressBlock}
						>
							<option value="" disabled>Select block</option>
							{#each blockValue as block}
								<option value={block.value}>{block.value}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label for="Lot" class="label">
							<span class="label-text">Lot</span>
						</label>
						<select class="select select-bordered w-full" required bind:value={account.addressLot}>
							<option value="" disabled>Select lot</option>
							{#each lotValue as lot}
								<option value={lot.value}>{lot.value}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label for="Street" class="label">
							<span class="label-text">Street</span>
						</label>
						<select
							class="select select-bordered w-full"
							aria-label="Default select example"
							required
							bind:value={account.addressStreet}
						>
							<option value="" selected disabled>Select street</option>
							{#each listOfStreets as street}
								<option value={street.streetName}>{street.streetName}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
					<div class="form-control">
						<label for="fname" class="label">
							<span class="label-text">E-mail Address</span>
						</label>
						<input
							type="text"
							placeholder="juandelacruz@gmail.com"
							name="email"
							class="input input-bordered"
							required
							bind:value={account.email}
						/>
						<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
							<div class="form-control">
								<label for="password" class="label">
									<span class="label-text">Password</span>
								</label>
								<input
									class="input input-bordered"
									type="password"
									placeholder="New Password"
									required
									bind:value={account.password}
								/>
							</div>
							<div class="form-control">
								<label for="cpassword" class="label">
									<span class="label-text">Confirm Password</span>
								</label>
								<input
									class="input input-bordered"
									type="password"
									placeholder="Confirm Password"
									required
									bind:value={account.passwordcheck}
								/>
								{#if account.password != account.passwordcheck && account.passwordcheck != ''}
									<div class="alert alert-error shadow-lg my-3 w-full">
										<div>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="stroke-current flex-shrink-0 h-6 w-6"
												fill="none"
												viewBox="0 0 24 24"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
												/></svg
											>
											<span>Passwords do not match</span>
										</div>
									</div>
								{/if}
							</div>
						</div>
						<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
							<div class="form-control">
								<span class="label-text mb-3">Role</span>
								<div class="mb-3">
									<select
										class="select select-bordered w-full"
										aria-label="Default select example"
										required
										bind:value={account.role}
									>
										<option value="" selected disabled>Select role</option>
										<option value="Resident">Resident</option>
										<option value="Admin">Admin</option>
									</select>
								</div>
							</div>
							<div class="form-control">
								<span class="label-text mb-3">Payment Head</span>
								<div class="mb-3">
									<select
										class="select select-bordered w-full"
										aria-label="Default select example"
										required
										bind:value={account.paymentHead}
									>
										<option value="" selected disabled>Select</option>
										<option value={true}>Yes</option>
										<option value={false}>No</option>
									</select>
								</div>
							</div>
						</div>
						<div class="form-control">
							<label for="lname" class="label">
								<span class="label-text">Contact No.</span>
							</label>
							<input
								type="tel"
								onkeypress="return event.charCode >= 48 && event.charCode <= 57"
								minlength="11"
								maxlength="11"
								placeholder="09123456789"
								pattern={String.raw`^(09)\d{9}$`}
								name="contact"
								class="input input-bordered"
								required
								bind:value={account.contactNumber}
							/>
						</div>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary mx-1 px-6">Create</button>
					<a href="/admin/accounts" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
				</div>
			</form>
		</div>
	</div>
</main>
