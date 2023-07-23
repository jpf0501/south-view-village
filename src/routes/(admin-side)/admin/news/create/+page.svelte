<script>
	import { db } from '$lib/firebase/client';
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import { getNextDate } from '$lib/dateUtils.js';
	import { addLog } from '$lib/logs'
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../lib/Components/Confirmation.svelte';

	let today = new Date();
	let formattedDateMin;

	const { formattedDate: calculatedFormattedDate } = getNextDate(today);
	formattedDateMin = calculatedFormattedDate;

	const storage = getStorage();

	let news = {
		title: '',
		content: '',
		imageURL: '',
		expiration: ''
	};
	let errors = {};
	let newImageFile = null;
	let previewImage = '';
	let hideImageLabel = false;
	let confirmation = false;
	let confirmationText;

	async function handleSubmit() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		confirmationText = `Do you want to create news "${news.title}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		await createNews();
	}

	async function cancelSubmit() {
		confirmation = false;
	}


	function handleImageChange(event) {
		hideImageLabel = true;
		const file = event.target.files[0];
		if (file) {
			newImageFile = file;

			// Read the selected image file and create a URL for preview
			const reader = new FileReader();
			reader.onload = (e) => {
				previewImage = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function openImageInput() {
		const input = document.getElementById('imageInput');
		if (input) {
			input.click();
		}
	}

	async function checkInput() {
		errors = {
			title: !news.title,
			content: !news.content,
			contentKulang: news.content.length < 10,
			noExpiry: !news.expiration
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function createNews() {
		const uniqueID = generateUniqueId();
		// console.log(uniqueId);
		if (newImageFile) {
			const storageRef = ref(storage, `images/news/${uniqueID}`);
			const uploadTask = uploadBytes(storageRef, newImageFile);

			const snapshot = await uploadTask;
			const downloadURL = await getDownloadURL(snapshot.ref);

			// Update the committee with the new image URL
			news.imageURL = downloadURL;
		}
		try {
			await addDoc(collection(db, 'news'), {
				title: news.title.trim().toLowerCase(),
				titleDisplay: news.title.trim(),
				content: news.content.trim(),
				expiration: news.expiration,
				imageURL: news.imageURL,
				imageURLID: uniqueID,
				dateCreated: serverTimestamp(),
				dateModified: serverTimestamp()
			});
			addLog(`"Created news - ${news.title}"`,"News")
			toast.success('News entry added!');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in adding news entry!');
		}
	}

	function generateUniqueId() {
		const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
		const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string and extract a substring

		return `${timestamp}-${randomString}`;
	}
</script>

<svelte:head>
	<title>Add News Form - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>
<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl pb-8">Add News</h1>
		<form>
			<div class="form-control flex flex-row gap-10 justify-between">
				<div class="flex flex-col w-full">
					<span class="pb-3">News Title</span>
					{#if errors.title}
						<p class="text-red-500 text-sm italic mb-1">News title is required</p>
					{/if}
					<input type="text" class="input input-bordered p-3 mt-2" bind:value={news.title} />
				</div>

				<div class="flex flex-col">
					<span class="pb-3">Expiration Date</span>
					{#if errors.noExpiry}
						<p class="text-red-500 text-sm italic mb-1">Expiration date is required</p>
					{/if}
					<input
						type="date"
						class="input input-bordered p-3 mt-2"
						min={formattedDateMin}
						bind:value={news.expiration}
					/>
				</div>
			</div>
			<div class="my-6">
				<div class="mb-4">
					<label for="">Image</label>
				</div>
				<div>
					{#if previewImage}
						<div class="mb-3">
							<img
								class="border border-black rounded-md w-64 h-48 object-cover"
								src={previewImage}
								alt="Selected_Photo"
							/>
						</div>
					{/if}
					{#if hideImageLabel === false}
						<button class="btn btn-primary" type="button" on:click={openImageInput}
							>Add Image</button
						>
						<input
							type="file"
							accept="image/*"
							class="hidden"
							id="imageInput"
							on:change={handleImageChange}
						/>
					{:else if hideImageLabel === true}
						<div class="flex flex-row gap-3">
							<button class="btn btn-primary" type="button" on:click={openImageInput}
								>Change Image</button
							>
							<input
								type="file"
								accept="image/*"
								class="hidden"
								id="imageInput"
								on:change={handleImageChange}
							/>
							<button
								class="btn btn-error text-white"
								type="button"
								on:click={() => {
									hideImageLabel = false;
									previewImage = '';
								}}>Cancel</button
							>
						</div>
					{/if}
				</div>
			</div>
			<div class="mt-6">
				<div class="form-control">
					<span class="pb-3">Event Desciption</span>
					{#if errors.content}
						<p class="text-red-500 text-sm italic mb-1">News content is required</p>
					{:else if errors.contentKulang}
						<p class="text-red-500 text-sm italic mb-1">
							News content must at least be 10 characters
						</p>
					{/if}
					<textarea
						class="h-60 textarea textarea-bordered p-3"
						style="white-space:pre-wrap; resize:none"
						bind:value={news.content}
					/>
				</div>
			</div>
			<div class="flex justify-end mt-8">
				<button on:click={handleSubmit} type="button" class="btn btn-primary">Add Entry</button>
				<a href="/admin/news" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
