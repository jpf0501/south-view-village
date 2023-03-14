<script>
	import { auth } from '$lib/firebase/client';
	import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	let showChangePassword;
	let showOldPasswordFiled = false;
	let newPassword = '';
	let newPasswordCheck = '';
	let oldPassword = '';

	let errors = {};

	async function submitHandler() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		showOldPasswordFiled = true;
	}

	async function checkInput() {
		errors = {
			newPassword: !newPassword,
			newPasswordCheck: !newPasswordCheck,
			newPasswordLength: newPassword.length < 6,
			passwordNotMatch: newPassword !== newPasswordCheck
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function promptForCredentials() {
		const email = auth.currentUser.email;
		const credential = EmailAuthProvider.credential(email, oldPassword);
		try {
			await reauthenticateWithCredential(auth.currentUser, credential);
			// console.log('re-authenticate sucess');
		} catch (error) {
			console.log(error);
			toast.error('Incorrect password');
			return;
		}

		try {
			await updatePassword(auth.currentUser, newPassword);
			toast.success('Password Updated!');
			goto('/profile');
		} catch (error) {
			console.log(error);
			toast.error('Error in Updating Password');
		}
	}
</script>

{#if !showChangePassword}
	<button class="btn btn-primary mx-1" on:click={() => (showChangePassword = true)}
		>Change Password</button
	>
{/if}

{#if showChangePassword}
	<form on:submit={submitHandler}>
		<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
			<div class="form-control">
				<span>New Password</span>
				{#if errors.newPassword}
					<p class="text-red-500 text-sm italic mb-1">Password is required</p>
				{:else if errors.newPasswordLength}
					<p class="text-red-500 text-sm italic mb-1">Password must be at least 6 characters</p>
				{/if}
				<input class="input input-bordered mt-2" type="password" bind:value={newPassword} />
			</div>
			<div class="form-control">
				<span>Confirm New Password</span>
				{#if errors.newPasswordCheck}
					<p class="text-red-500 text-sm italic mb-1">Confirm password is required</p>
				{:else if errors.passwordNotMatch}
					<p class="text-red-500 text-sm italic mb-1">Password do not match</p>
				{/if}
				<input class="input input-bordered mt-2" type="password" bind:value={newPasswordCheck} />
			</div>
		</div>
		<div class="flex justify-end mt-8">
			<button type="submit" class="btn btn-primary mx-1">Save New Password</button><br />
			<button
				type="button"
				class="btn btn-error mx-1 px-4 text-white"
				on:click={() => (showChangePassword = false)}>Cancel</button
			>
		</div>
	</form>
{/if}
{#if showOldPasswordFiled}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
	>
		<div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
		<div class="relative z-50 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
			<div class="p-6">
				<h2 class="text-lg font-medium">Enter Old Password</h2>
				<input
					type="paassword"
					placeholder="Old Password"
					bind:value={oldPassword}
					class="mt-6 input input-bordered w-full max-w-xs"
				/>
			</div>
			<div class="flex justify-end px-6 gap-2 py-4">
				<button class="btn btn-primary" on:click={promptForCredentials}>Submit</button>
				<button class="btn btn-error text-white" on:click={() => (showOldPasswordFiled = false)}
					>Cancel</button
				>
			</div>
		</div>
	</div>
{/if}
