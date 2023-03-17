<script>
	import { db } from '$lib/firebase/client';
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	let news = {
		title: '',
		content: ''
	};
	let errors = {};

	async function submitHandler() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		createNews();
	}

	async function checkInput() {
		errors = {
			title: !news.title,
			content: !news.content,
			contentKulang: news.content.length < 10
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
		try {
			await addDoc(collection(db, 'news'), {
				title: news.title.trim().toLowerCase(),
				titleDisplay: news.title.trim(),
				content: news.content.trim(),
				dateCreated: serverTimestamp(),
				dateModified: serverTimestamp()
			});
			toast.success('News entry added!');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in adding news entry!');
		}
	}
</script>

<svelte:head>
	<title>Add News Form - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl pb-8">Add News</h1>
		<form on:submit|preventDefault={submitHandler}>
			<div class="form-control">
				<span class="pb-3">News Title</span>
				{#if errors.title}
					<p class="text-red-500 text-sm italic mb-1">News title is required</p>
				{/if}
				<input type="text" class="input input-bordered p-3 mt-2" bind:value={news.title} />
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
				<button type="submit" class="btn btn-primary">Add Entry</button>
				<a href="/admin/news" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
