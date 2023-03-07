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

	async function getInquiry() {
		try {
			const snapshot = await getDoc(doc(db, 'inquiries', inquiryID));
			inquiry = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting inquiry');
		}
	}

	async function answerInquiry(name, email, message, response) {
		try {
			const inquiryRef = doc(db, 'inquiries', inquiryID);
			const changeData = {
				hadAnswered: true,
				response: inquiry.response
			};
			await updateDoc(inquiryRef, changeData);
			try {
				await sendEmail({
					to: email,
					subject: 'Southview Homes 3 Inquiries',
					html: `<h1>Hello ${name}, </h1> <div> We have receive your inquiry about</div><div>${message}</div><h1>Our Response is </h1><div>${response}</div>`
				});
				toast.success('Response sent!');
			} catch (error) {
				console.log(error);
				toast.error('Error in sending reponse of the inquiry');
			}
			goto('/admin/inquiries');
		} catch (error) {
			console.log(error);
			toast.error('Error sending response!');
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
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl mt-2">Inquiry by {inquiry.nameDisplay}</h1>
			<form>
				<div class="form-control">
					<span class="pb-3">Inquiry</span>
					<div class="h-60 border-black border-2">
						{inquiry.message}
					</div>
				</div>
				<div class="form-control">
					<span class="pb-3">Response</span>
					<textarea
						class="h-60 textarea textarea-bordered p-3"
						style="white-space:pre-wrap; resize:none"
						required
						bind:value={inquiry.response}
					/>
				</div>

				<div class="flex justify-end mt-8">
					<button
						on:click={answerInquiry(inquiry.name, inquiry.email, inquiry.message, inquiry.response)}
						type="submit"
						class="btn btn-primary">Submit</button
					>
					<a href="/admin/inquiries" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={deleteInquiry} type="submit" class="btn btn-warning mx-1 text-white"
						>Delete</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
