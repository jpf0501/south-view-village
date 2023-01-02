<script>
	import { db } from '$lib/firebase/client';
	import {
		getDoc,
		updateDoc,
		deleteDoc,
		doc,
		serverTimestamp,
		deleteField
	} from 'firebase/firestore';
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

	let news = null;

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
	}
	getNews();

	async function updateNews() {
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
</script>

<svelte:head>
	<title>Edit Entry - Southview Homes 3 Admin Panel</title>
</svelte:head>

{#if news}
	<div>
		<div class="grid place-items-center py-10">
			<div class="w-11/12">
				<h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Edit News</h1>
				<form>
					<div class="my-2">
						<label for="title">Title</label>
						<br />
						<input type="text" class="w-1/2" required bind:value={news.title} />
					</div>
					<div class="my-2">
						<label for="content">Content</label>
						<br />
						<textarea class="h-60 w-5/6" style="resize:none" required bind:value={news.content} />
					</div>
					<div class="flex justify-end mt-8">
						<button
							on:click={updateNews}
							type="submit"
							class="btn btn-primary mx-1 px-5 bg-blue-500 hover:bg-blue-900">Save</button
						><a href="/admin/news" class="btn btn-primary mx-1 px-4 bg-red-500 hover:bg-red-900"
							>Cancel</a
						>
						<button
							on:click={deleteNews}
							type="submit"
							class="btn btn-warning mx-1 hover:bg-red-900 text-white">Delete</button
						>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
