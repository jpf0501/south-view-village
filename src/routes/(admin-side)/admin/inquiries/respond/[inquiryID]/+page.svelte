<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { sendEmail } from '$lib/utils';
	import Confirmation from '../../../../../../lib/Components/Confirmation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { inquiryID } = data;

	let inquiry = null;
	let errors = {};
	let confirmation = false;
	let confirmationText;
	let handleWhat;

	async function handleSendResponse() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		handleWhat = 'Send Response';
		confirmation = true;
	}

	function handleDeleteInquiry() {
		confirmationText = 'Are you sure you want to delete the inquiry?';
		handleWhat = 'Delete';
		confirmation = true;
	}

	function handleNoResponseInquiry() {
		confirmationText = 'No response to the inquiry?';
		handleWhat = 'No Response';
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		if (handleWhat === 'Delete') {
			await deleteInquiry();
			console.log('Running');
		} else if (handleWhat === 'No Response') {
			await noResponse();
		} else if (handleWhat === 'Send Response') {
			await answerInquiry();
			await sendResponseToEmail();
		}
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function getInquiry() {
		try {
			const snapshot = await getDoc(doc(db, 'inquiries', inquiryID));
			inquiry = snapshot.data();
		} catch (error) {
			console.log(error);
			toast.error('Error in getting inquiry');
		}
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

	async function answerInquiry() {
		const response = inquiry.response;
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

	async function sendResponseToEmail() {
		const name = inquiry.name;
		const email = inquiry.email;
		const response = inquiry.response;
		try {
			await sendEmail({
				to: email,
				subject: 'Southview Homes 3 Inquiries',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				</center>
					<p>Dear ${name},</p>
					<p>Thank you for reaching out to us with your question. We appreciate your interest in our community and we are happy to help.</p>
					<p>In response to your inquiry,</p> 
					<p>${response}</p>
					<p>If you need further assistance, please do not hesitate to let us know.</p>
					<p>We value your feedback and would like to assure you that we are committed to providing excellent customer service. If you have any other questions or concerns, please feel free to contact us.</p>
					<p>Thank you for your time and interest in Southview Homes 3.</p>
					<p>Best regards,</p>
					<p>Soutview Homes 3</p>`
			});
			toast.success('Response sentto email!');
		} catch (error) {
			console.log(error);
			toast.error('Error in sending reponse of the inquiry');
		}
	}

	async function noResponse() {
		try {
			await sendEmail({
				to: inquiry.email,
				subject: 'Southview Homes 3 Inquiries',
				html: `<center><h1><img src="https://ssv.vercel.app/logo.png"> Southview Homes 3</h1>
				<p style="font-size:12px">SVH3 San Vicente Road, Brgy., San Vicente, San Pedro, Laguna</p><br/>
				</center>
					<p>Dear ${inquiry.nameDisplay},</p>
					<p>We would like to extend our heartfelt apologies for the inconvenience caused by our inability to provide a satisfactory response to your inquiry. We genuinely understand the importance of your question and the frustration that comes with not receiving a timely and comprehensive answer.</p>

					<p>While we strive to address all inquiries promptly and effectively, there are circumstances beyond our control that may hinder us from providing the desired information at this moment. It could be due to the complexity of the matter, limited resources, or ongoing developments that require further investigation or consultation.</p> 

					<p>Please be assured that we value your inquiry and understand the significance of your concerns. Our team is actively working to resolve this situation and gather the necessary information to provide you with a meaningful and accurate response. We ask for your patience and understanding as we navigate through these challenges to offer you the assistance you deserve.</p>

					<p>In the meantime, if you have any additional questions or if there's any other way we can assist you, please don't hesitate to let us know. We remain committed to ensuring your satisfaction and will do our utmost to address your concerns as soon as possible.</p>			

					<p>Once again, we deeply apologize for any inconvenience caused by our current inability to answer your inquiry. We appreciate your understanding and look forward to the opportunity to better serve you in the future.</p>

					<p>Best regards,</p>

					<p>Soutview Homes 3</p>`
			});
			try {
				const inquiryRef = doc(db, 'inquiries', inquiryID);
				const changeData = {
					hadAnswered: true
				};
				await updateDoc(inquiryRef, changeData);
				goto('/admin/inquiries');
			} catch (error) {
				console.log(error);
				toast.error('Error sending response!');
			}
			toast.success('Response sent to email!');
			goto('/admin/inquiries');
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

<Confirmation
	show={confirmation}
	onConfirm={confirmSubmit}
	onCancel={cancelSubmit}
	{confirmationText}
/>

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
					<button on:click={handleSendResponse} type="submit" class="btn btn-primary">
						Submit Response
					</button>
					<a href="/admin/inquiries" class="btn btn-error mx-1 text-white">Cancel</a>
				</div>
			</form>
			<div class="flex flex-row justify-end my-2">
				<button
					on:click={handleNoResponseInquiry}
					type="button"
					class="btn btn-error text-white mx-1 "
				>
					No Response
				</button>
				<button
					on:click={handleDeleteInquiry}
					type="button"
					class="btn btn-warning mx-1 text-white"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
