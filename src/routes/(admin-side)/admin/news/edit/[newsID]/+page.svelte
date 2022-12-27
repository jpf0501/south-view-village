<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, deleteDoc, doc, serverTimestamp, deleteField } from 'firebase/firestore';
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
			await updateDoc(doc(db, 'news', newsID), news), {
				title: news.title,
				content: news.content,
				dateModified: serverTimestamp(),
			}
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

{#if news}
	<div>
		<div class="grid place-items-center py-10">
			<div class="w-11/12">
				<div>
					<h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Edit News</h1>
				</div>
				<form action="">
					<div class="">
						<label for="title">Title</label>
						<br />
						<input type="text" class="w-1/2" required bind:value={news.title} />
					</div>
					<div>
						<label for="content">Content</label>
						<br />
						<textarea class="h-60 w-5/6" required bind:value={news.content} />
					</div>
					<div class="grid place-items-center my-10">
						<div class="flex gap-5">
							<button on:click={updateNews} type="submit" class="bg-blue-500 px-10 py-2"
								>Save</button
							>
							<button on:click={deleteNews} type="submit" class="bg-red-500 px-10 py-2"
								>Delete</button
							>
							<a href="/admin/news" class="bg-green-500 px-10 py-2">Cancel</a>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
