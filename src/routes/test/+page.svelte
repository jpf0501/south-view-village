<script>
	import { sendEmail } from '$lib/utils';

	async function clickHandler() {
		const result = await sendEmail({
			to: 'kyleandradebasquena@gmail.com',
			subject: 'Testing svelte email',
			html: '<h1>Hello World</ht>'
		});
        console.log(JSON.stringify(result)); 
        alert("Email sent successfuly");
	}
</script>

<button class="btn btn-info" on:click={clickHandler}> send email </button> 