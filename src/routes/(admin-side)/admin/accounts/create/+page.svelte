<script>
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let passwordcheck = '';
	let firstname = '';
	let lastname = '';
	let addressBlock = '';
	let addressLot = '';
	let addressStreet = '';
	let contactNumber = '';
	let role = '';

	async function submitHandler() {
		try {
			if (password != passwordcheck) {
				throw 'Passwords do not match';
			}
			const response = await fetch('/api/accounts', {
				method: 'POST',
				body: JSON.stringify({
					email,
					password,
					firstname,
					lastname,
					addressBlock,
					addressLot,
					addressStreet,
					contactNumber,
					role
				})
			});
			const result = await response.json();
			console.log(result);
			alert('Save success ' + result.uid);
			await goto('/admin/accounts');
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}
</script>

<main>
	<div class="min-h-screen hero bg-base-200">
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
							bind:value={firstname}
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
							bind:value={lastname}
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-5">
					<div class="form-control">
						<label for="Block" class="label">
							<span class="label-text">Block</span>
						</label>
						<input
							type="number"
							placeholder="1"
							name="Block"
							class="input input-bordered"
							required
							bind:value={addressBlock}
						/>
					</div>
					<div class="form-control">
						<label for="Lot" class="label">
							<span class="label-text">Lot</span>
						</label>
						<input
							type="number"
							placeholder="1"
							name="Lot"
							class="input input-bordered"
							required
							bind:value={addressLot}
						/>
					</div>
					<div class="form-control">
						<label for="Street" class="label">
							<span class="label-text">Street</span>
						</label>
						<input
							type="text"
							placeholder="1"
							name="Street"
							class="input input-bordered"
							required
							bind:value={addressStreet}
						/>
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
							bind:value={email}
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
									bind:value={password}
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
									bind:value={passwordcheck}
								/>
								{#if password != passwordcheck && passwordcheck != ''}
									<p class="text-red-500 mt-3">Password doesnt match</p>
								{/if}
							</div>
							<div class="form-control">
								<span class="label-text mb-3">Role</span>
								<div class="mb-3">
									<select
										class="form-select appearance-none block w-full px-3 py-1.5 text-base border rounded-xl border-gray-300"
										aria-label="Default select example"
										required
										bind:value={role}
									>
										<option value="Resident">Resident</option>
										<option value="Admin">Admin</option>
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
								placeholder="09123456789"
								name="contact"
								class="input input-bordered"
								required
								bind:value={contactNumber}
							/>
						</div>
					</div>
					<div class="flex justify-end mt-8">
						<button type="submit" class="btn btn-primary mx-1">Save</button>
						<a href="/admin/accounts" class="btn btn-error mx-1">Cancel</a>
					</div>
				</div>
			</form>
		</div>
	</div>
</main>
