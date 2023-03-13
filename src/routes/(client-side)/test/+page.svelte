<script>
	import { sendEmail } from '$lib/utils';
	import { onSnapshot, query } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';

	async function clickHandler() {
		const result = await sendEmail({
			to: 'rodelgerodias25@gmail.com',
			subject: 'Southview Homes 3 Notice',
			html: '<h1>This is a test message</ht>'
		});
		console.log(JSON.stringify(result));
		alert('Email sent successfuly');
	}

	let unsubscribe = () => {
		console.log('Unsubscribe trigger');
	};

	function setUpRealtimeListener(query) {
		unsubscribe();
		unsubscribe = onSnapshot(query);
	}

	onDestroy(() => unsubscribe());
	$: setUpRealtimeListener(query);
</script>

<button class="btn btn-info" on:click={clickHandler}> send email </button>
