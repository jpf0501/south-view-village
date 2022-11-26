<script>
	import { sendEmail } from '$lib/utils';

	async function clickHandler() {
		const result = await sendEmail({
			to: 'rodelgerodias25@gmail.com',
			subject: 'Test 1',
			html: '<h1>Hello World</ht>'
		});
        console.log(JSON.stringify(result)); 
        alert("Email sent sucessfuly");
	}
</script>

<button class="btn btn-info" on:click={clickHandler}> send email </button> 