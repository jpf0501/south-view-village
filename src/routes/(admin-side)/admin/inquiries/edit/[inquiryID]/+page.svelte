<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';

	/** @type {import('./$types').PageData} */
	export let data;
	const { inquiryID } = data;

	let inquiry = null;
	let errors = {};

	async function getInquiry() {
		try {
			const snapshot = await getDoc(doc(db, 'inquiries', inquiryID));
			inquiry = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting inquiry');
		}
	}

	async function submitHandler(name, email, message, response) {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		await answerInquiry(response);
		sendResponseToEmail(name, email, message, response);
	}

	async function checkInput() {
		errors = {
			response: !inquiry.response,
			responseKulang: inquiry.response.length < 10
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function answerInquiry(response) {
		try {
			const inquiryRef = doc(db, 'inquiries', inquiryID);
			const changeData = {
				hadAnswered: true,
				response: response
			};
			await updateDoc(inquiryRef, changeData);
			goto('/admin/inquiries');
		} catch (error) {
			console.log(error);
			toast.error('Error sending response!');
		}
	}

	async function sendResponseToEmail(name, email, message, response) {
		try {
			await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Inquiries',
				html: `<h1>Hello ${name}, </h1> <div> We have receive your inquiry about</div><div style="white-space:pre-wrap">${message}</div><h1>Our Response is </h1><div style="white-space:pre-wrap">${response}</div>`
			});
			toast.success('Response sentto email!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending reponse of the inquiry');
		}
	}

	async function deleteInquiry() {
		try {
			await deleteDoc(doc(db, 'inquiries', inquiryID), inquiry);
			toast.success('Inquiry deleted!');
			await goto('/admin/inquiries');
		} catch (error) {
			console.log(error);
			toast.error('Error in deleting in inquiry!');
		}
	}
	getInquiry();
</script>

<svelte:head>
	<title>Answer Inquiry - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if inquiry}
	<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-lg rounded-xl bg-white">
			<h1 class="text-2xl font-bold mb-4">Inquiry by {inquiry.nameDisplay}</h1>
			<form class="w-full">
				<div class="flex flex-col mb-6">
					<div class="text-gray-700 font-bold mb-2">Inquiry</div>
					<div class="h-60 border rounded-md p-4 overflow-y-scroll">
						{inquiry.message}
					</div>
				</div>
				<div class="flex flex-col mb-6">
					<div class="text-gray-700 font-bold mb-2">Response</div>
					{#if errors.response}
						<p class="text-red-500 text-sm italic mb-1">Response is required</p>
					{:else if errors.responseKulang}
						<p class="text-red-500 text-sm italic mb-1">Response must at least be 10 characters</p>
					{/if}
					<textarea class="h-60 border rounded-md p-4 resize-none" bind:value={inquiry.response} />
					<!-- <p class="text-gray-500 text-sm mt-2">{inquiry.response.length} characters</p> -->
				</div>
				<div class="flex justify-end mt-8">
					<button
						on:click={submitHandler(inquiry.name, inquiry.email, inquiry.message, inquiry.response)}
						type="submit"
						class="btn btn-primary"
					>
						Submit
					</button>
					<a href="/admin/inquiries" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={deleteInquiry} type="submit" class="btn btn-warning mx-1 text-white">
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
