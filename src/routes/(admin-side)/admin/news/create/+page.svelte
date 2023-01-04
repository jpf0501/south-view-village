<script>
	import { db } from '$lib/firebase/client';
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';

	let news = {
		title: '',
		content: ''
	};

	async function submitHandler() {
		try {
			await addDoc(collection(db, 'news'), {
				title: news.title.trim().toLowerCase(),
				titleDisplay: news.title.trim(),
				content: news.content.trim(),
				dateCreated: serverTimestamp(),
				dateModified: serverTimestamp()
			});
			alert('News entry created');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}
</script>

<div>
	<div class="grid place-items-center py-10">
		<div class="w-11/12">
			<h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Add News</h1>
			<form on:submit|preventDefault={submitHandler}>
				<div class="my-2">
					<label for="title">Title</label>
					<br />
					<input type="text" class="w-1/2" required bind:value={news.title} />
				</div>
				<div class="my-2">
					<label for="content">Content</label>
					<br />
					<textarea class="h-60 w-5/6" style="white-space:pre-wrap; resize:none" required bind:value={news.content} />
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary mx-1 px-4 bg-blue-500 hover:bg-blue-900"
						>Add News</button
					>
					<a
						href="/admin/news"
						class="btn btn-primary mx-1 bg-red-500 px-4 hover:bg-red-900 text-white">Cancel</a
					>
				</div>
			</form>
		</div>
	</div>
</div>
