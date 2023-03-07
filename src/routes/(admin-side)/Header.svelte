<script>
	import { userStore } from '$lib/store.js';
	import { auth, db } from '$lib/firebase/client.js';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { getDoc, doc } from 'firebase/firestore';
	import toast from 'svelte-french-toast';

	async function logOut() {
		try {
			await signOut(auth);
			toast.success('Signed Out!')
			goto('/');
		} catch (error) {
			console.log(error);
			toast.error('Error in Signing Out!');
		}
	}

	let user = '';

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
</script>

<div class="navbar bg-base-100 fixed top-0 z-50 drop-shadow-2xl">
	<div class="navbar-start">
		<div class="dropdown">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
						clip-rule="evenodd"
					/>
				</svg>
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li><a href="/admin/accounts">Accounts</a></li>
				<li><a href="/admin/bookings">Bookings</a></li>
				<li><a href="/admin/calendar">Calendar</a></li>
				<li><a href="/admin/news">News</a></li>
				<li><a href="/admin/payment">Payment</a></li>
				<li><a href="/admin/inquiries">Inquiries</a></li>
			</ul>
		</div>
		<a href="/admin" class="btn btn-ghost normal-case text-xl"
			><div class="flex items-center">
				<img class="h-10 w-23 rounded-full mr-2" src="/logo.png" alt="Southview Homes 3 Logo" />
				<h1 class="text-xl font-bold">Southview Homes 3</h1>
			</div></a
		>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/admin/accounts">Accounts</a></li>
			<li><a href="/admin/bookings">Bookings</a></li>
			<li><a href="/admin/calendar">Calendar</a></li>
			<li><a href="/admin/news">News</a></li>
			<li><a href="/admin/payment">Payment</a></li>
			<li><a href="/admin/inquiries">Inquiries</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<div class="dropdown dropdown-end">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label tabindex="0" class="btn btn-ghost btn-circle avatar">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
						clip-rule="evenodd"
					/>
				</svg>
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
			>
				<p class="text-sm font-semibold px-4 py-3">Hello {user.firstNameDisplay}</p>
				<li class="pb-2"><button on:click={logOut}>Logout</button></li>
			</ul>
		</div>
	</div>
</div>
