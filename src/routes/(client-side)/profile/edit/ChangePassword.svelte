<script>
	import { auth } from '$lib/firebase/client';
	import { updatePassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	let showChangePassword;
	let newPassword = '';
	let newPasswordCheck = '';

	async function changePassword() {
		if (newPassword !== newPasswordCheck) {
			alert('Password not match');
			return;
		}
		try {
			await updatePassword(auth.currentUser, newPassword);
			alert('Update password success');
			goto('/profile');
		} catch (error) {
			console.log(error);
			alert('Error in updating password');
		}
	}
</script>

{#if !showChangePassword}
	<button class="btn btn-primary mx-1" on:click={() => (showChangePassword = true)}
		>Change Password</button
	>
{/if}

{#if showChangePassword}
	<form on:submit={changePassword}>
		<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
			<div class="form-control">
				<span>New Password</span>
				<input
					class="input input-bordered mt-2"
					type="password"
					bind:value={newPassword}
					required
				/>
			</div>
			<div class="form-control">
				<span>Confirm New Password</span>
				<input
					class="input input-bordered mt-2"
					type="password"
					bind:value={newPasswordCheck}
					required
				/>
			</div>
		</div>
		<div class="flex justify-end mt-8">
			<button type="submit" class="btn btn-primary mx-1">Save New Password</button><br />
			<button
				type="button"
				class="btn btn-error mx-1 text-white"
				on:click={() => (showChangePassword = false)}>Cancel Change Password</button
			>
		</div>
	</form>
{/if}
