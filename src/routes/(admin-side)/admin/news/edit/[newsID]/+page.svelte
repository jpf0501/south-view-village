<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
	import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import { getNextDate } from '$lib/dateUtils.js';
	import { addLog } from '$lib/logs';
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../../lib/Components/Confirmation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

	const storage = getStorage();

	let news = null;
	let newImageFile = null;
	let previewImage = '';
	let hideImageLabel = false;
	let errors = {};
	let confirmation = false;
	let confirmationText;
	let handleWhat;
	let initialNews


	let today = new Date();
	let formattedDateMin;

	const { formattedDate: calculatedFormattedDate } = getNextDate(today);
	formattedDateMin = calculatedFormattedDate;

	
	async function handleNewsUpdate() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		handleWhat = 'Update';
		confirmationText = `Do you want to save changes in this news "${news.title}"`;
		confirmation = true;
	}

	async function handleNewsDelete() {
		handleWhat = 'Delete';
		confirmationText = `Do you want to delete this news "${news.title}"`;
		confirmation = true;
	}

	async function confirmSubmit() {
		confirmation = false;
		if (handleWhat === 'Update') {
			await updateNews();
		} else if (handleWhat === 'Delete') {
			await deleteNews();
		}
	}

	async function cancelSubmit() {
		confirmation = false;
	}

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
		initialNews = news.titleDisplay
		news.title = news.titleDisplay;
	}

	async function checkInput() {
		errors = {
			title: !news.titleDisplay,
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

	async function updateNews() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		news.title = news.titleDisplay.toLowerCase();

		if (newImageFile) {
			const storageRef = ref(storage, `images/news/${news.imageURLID}`);
			const uploadTask = uploadBytes(storageRef, newImageFile);

			const snapshot = await uploadTask;
			const downloadURL = await getDownloadURL(snapshot.ref);

			// Update the committee with the new image URL
			news.imageURL = downloadURL;
		}

		try {
			news.dateModified = serverTimestamp();
			await updateDoc(doc(db, 'news', newsID), news);
			addLog(`"Update news of ${initialNews}"`, "News")
			toast.success('News details updated!');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating news!');
		}
	}

	async function deleteNews() {
		try {
			await deleteDoc(doc(db, 'news', newsID), news);
			toast.success('News deleted!');
			addLog(`"Delete news of ${initialNews}"`, "News")
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in deleting news!');
		}
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

	getNews();
</script>

<svelte:head>
	<title>Edit News - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>
{#if news}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl pb-8">Edit News</h1>
			<form>
				<div class="form-control flex flex-row justify-between gap-10">
					<div class="flex flex-col w-full">
						<span class="pb-3">News Title</span>
						{#if errors.title}
							<p class="text-red-500 text-sm italic mb-1">News title is required</p>
						{/if}
						<input
							type="text"
							class="input input-bordered p-3 mt-2"
							bind:value={news.titleDisplay}
						/>
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
				<div class="mt-6">
					<div class="mb-4">
						<label for="">Image</label>
					</div>
					<div class="mb-3">
						<div class="flex flex-row justify-between">
							<div class="mb-3">
								{#if news.imageURL !== ''}
									<img
										class="border border-black rounded-md w-64 h-48 object-cover"
										src={news.imageURL}
										alt="Selected_Photo"
									/>
								{/if}
							</div>
							{#if previewImage}
								<div class="mb-3">
									<label for="">New Picture:</label>
									<img
										class="border border-black rounded-md w-64 h-48 object-cover"
										src={previewImage}
										alt="Selected_Photo"
									/>
								</div>
							{/if}
						</div>
						{#if hideImageLabel === false}
							<button class="btn btn-primary" type="button" on:click={openImageInput}
								>Edit Image</button
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
						<span class="pb-3">News Desciption</span>
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
					<button on:click={handleNewsUpdate} type="submit" class="btn btn-primary">Save</button>
					<a href="/admin/news" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={handleNewsDelete} type="submit" class="btn btn-warning mx-1 text-white"
						>Delete</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
