<script>
    import { userStore } from '$lib/store.js';
    import { onSnapshot, doc } from 'firebase/firestore';
    import { auth, db } from '$lib/firebase/client.js';
    import { signOut } from 'firebase/auth';
	import { onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import toast from 'svelte-french-toast';

    let userAccount 
    let unsubscribe = () => {};
    const textColor = {
        default: 'text-orange-500',
        Unpaid: 'text-red-500',
        Paid: 'text-green-500'
    }

    async function getUser() {
        unsubscribe()
		unsubscribe = onSnapshot(doc(db, 'accounts', $userStore.uid), (doc) => {
			userAccount = doc.data();
		});
	}

    async function logOut() {
		try {
			await signOut(auth);
			toast.success('Signed Out!');
			goto('/');
		} catch (error) {
			console.log(error);
			toast.error('Error in Signing Out!');
		}
	}

    $: if ($userStore) {
        getUser()
    }
    onDestroy(() => unsubscribe())
    
</script>

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
        {#if !$userStore}
            <li><a href="/login">Login</a></li>
            <li class="pb-2"><a href="/register">Register</a></li>
        {:else}
            <p class="text-sm font-semibold px-4 py-3">Hello {userAccount?.firstNameDisplay || '...' }</p>
            <p class="text-sm font-bold px-4 py-3">
                Monthly Dues: <span
                    class={` ${textColor[userAccount?.paymentStatus || 'default' ]} `}
                    >{userAccount?.paymentStatus || '...'}</span
                >
            </p>
            <li><a href="/profile">Profile</a></li>
            <li class="pb-2"><button on:click={logOut}>Logout</button></li>
        {/if}
    </ul>
</div>