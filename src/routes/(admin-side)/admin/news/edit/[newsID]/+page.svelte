<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	/** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

	let news = null;
	let errors = {};

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
		news.title = news.titleDisplay;
	}

	async function updateNews() {
		news.title = news.titleDisplay.toLowerCase();
		errors = {
			title: !news.title,
			content: !news.content,
			contentKulang: news.content.length < 11
		};

		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		try {
			news.dateModified = serverTimestamp();
			await updateDoc(doc(db, 'news', newsID), news);
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
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in deleting news!');
		}
	}

	getNews();
</script>

<svelte:head>
	<title>Edit News - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if news}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl pb-8">Edit News</h1>
			<form>
				<div class="form-control">
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
					<button on:click={updateNews} type="submit" class="btn btn-primary">Save</button>
					<a href="/admin/news" class="btn btn-error mx-1 text-white">Cancel</a>
					<button on:click={deleteNews} type="submit" class="btn btn-warning mx-1 text-white"
						>Delete</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
