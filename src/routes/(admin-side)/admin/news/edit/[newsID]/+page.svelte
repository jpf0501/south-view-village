<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

	let news = null;

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
		news.title = news.titleDisplay;
	}

	async function updateNews() {
		news.title = news.titleDisplay.toLowerCase();
		try {
			news.dateModified = serverTimestamp();
			await updateDoc(doc(db, 'news', newsID), news);
			alert('News content updated');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}

	async function deleteNews() {
		try {
			await deleteDoc(doc(db, 'news', newsID), news);
			alert('Entry deleted');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			alert('Error deleting');
		}
	}

	getNews();
</script>

<svelte:head>
	<title>Edit Entry - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if news}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl pb-8">Edit News</h1>
			<form>
				<div class="form-control">
					<span class="pb-3">News Title</span>
					<input
						type="text"
						class="input input-bordered p-3 mt-2"
						bind:value={news.titleDisplay}
						required
					/>
				</div>
				<div class="mt-6">
					<div class="form-control">
						<span class="pb-3">Event Desciption</span>
						<textarea
							class="h-60 textarea textarea-bordered p-3"
							style="white-space:pre-wrap; resize:none"
							required
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
