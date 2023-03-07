<script>
	import { db } from '$lib/firebase/client';
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

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
			toast.success('News added!');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			toast.error('Error in adding news!');
		}
	}
</script>

<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
		<h1 class="text-2xl pb-8">Add News</h1>
		<form on:submit|preventDefault={submitHandler}>
			<div class="form-control">
				<span class="pb-3">News Title</span>
				<input
					type="text"
					class="input input-bordered p-3 mt-2"
					bind:value={news.title}
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
				<button type="submit" class="btn btn-primary">Add News</button>
				<a href="/admin/news" class="btn btn-error mx-1 text-white">Cancel</a>
			</div>
		</form>
	</div>
</div>
