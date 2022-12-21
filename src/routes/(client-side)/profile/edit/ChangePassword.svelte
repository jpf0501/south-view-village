<script>
	import { auth } from '$lib/firebase/client';
	import { updatePassword } from 'firebase/auth';
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
		} catch (error) {
			console.log(error);
			alert('Error in updating password');
		}
	}
</script>

<button on:click={() => (showChangePassword = true)}>Change Password</button>
{#if showChangePassword}
	<form on:submit={changePassword}>
		<div>
			<span>New Password</span>
			<input type="password" bind:value={newPassword} required />
			<span>Confirm New Password</span>
			<input type="password" bind:value={newPasswordCheck} required />
		</div>
		<button type="submit">Save New Password</button><br />
		<button type="button" on:click={() => (showChangePassword = false)}
			>Cancel change password</button
		>
	</form>
{/if}
