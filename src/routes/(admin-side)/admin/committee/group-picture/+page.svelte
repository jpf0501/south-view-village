<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, doc, updateDoc, query, collection, where } from 'firebase/firestore';
	import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';

	const storage = getStorage();

	let images;
	let newImageFile = null;
	let previewImage = '';
	let newImageFiles = [];
	let previewImages = [];
	let numberOfEmptyStrings = 0;

	let showAddPicture = true;

	const picture1URL =
		'https://firebasestorage.googleapis.com/v0/b/svh3-web.appspot.com/o/path%2Fto%2FgroupPictures%2F0?alt=media&token=ec2aac02-d2ed-485c-b726-593861c8e1a7';
	const picture2URL =
		'https://firebasestorage.googleapis.com/v0/b/svh3-web.appspot.com/o/path%2Fto%2FgroupPictures%2F1?alt=media&token=32e586d2-cc80-42ad-9bc3-4479cf8f6053';

	async function handleImageChange(event, index) {
		const file = event.target.files[0];
		if (file) {
			newImageFiles[index] = file;

			// Read the selected image file and create a URL for preview
			const reader = new FileReader();
			reader.onload = (e) => {
				previewImages[index] = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	function openImageInput(index) {
		const input = document.getElementById(`imageInput_${index}`);
		if (input) {
			input.click();
		}
	}

	async function updatePicture() {
		try {
			// Update the Firebase Storage for each new image file
			for (let i = 0; i < newImageFiles.length; i++) {
				const file = newImageFiles[i];
				if (file) {
					const storageRef = ref(storage, images.groupPictureURL[i]);
					await uploadBytes(storageRef, file);
				}
			}

			toast.success('Pictures updated successfully!');
			await goto('/admin/committee');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating pictures!');
		}
	}

	async function addPicture() {
		try {
			const pictureRef = doc(db, 'images', 'xKD5MysuEl9E0n2ap5Pe');
			const snapshot = await getDoc(pictureRef);
			const data = snapshot.data();
			if (data.groupPictureURL[0] === '' || data.groupPictureURL[1] === '') {
				if (data.groupPictureURL[0] === '') {
					data.groupPictureURL[0] = picture1URL; // Use the assignment operator '=' instead of '==='
					if (newImageFile) {
						const storageRef = ref(storage, picture1URL);
						const uploadTask = uploadBytes(storageRef, newImageFile);
					}
				} else if (data.groupPictureURL[1] === '') {
					data.groupPictureURL[1] = picture2URL; // Use the assignment operator '=' instead of '==='
					if (newImageFile) {
						const storageRef = ref(storage, picture2URL);
						const uploadTask = uploadBytes(storageRef, newImageFile);
					}
				}
			}
			await updateDoc(pictureRef, data);
			toast.success('Photo has been added!');
			await goto('/admin/committee/');
		} catch (error) {
			console.log(error);
		}
	}

	function handleImageChange2(event) {
		showAddPicture = false;
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

	function openImage2() {
		const input = document.getElementById('imageInput2');
		if (input) {
			input.click();
		}
	}

	async function deletePhoto(index) {
		const pictureRef = doc(db, 'images', 'xKD5MysuEl9E0n2ap5Pe');
		const snapshot = await getDoc(pictureRef);
		const data = snapshot.data();
		data.groupPictureURL[index] = '';
		await updateDoc(pictureRef, data);
		toast.success('Photo has been deleted!');
		await goto('/admin/committee/');
	}

	async function loadGroupPictures() {
		const snapshot = await getDoc(doc(db, 'images', 'xKD5MysuEl9E0n2ap5Pe'));
		images = snapshot.data();

		const groupPictureURL = images?.groupPictureURL || [];
		const emptyStrings = groupPictureURL.filter((url) => url === '');
		numberOfEmptyStrings = emptyStrings.length;
		// console.log(numberOfEmptyStrings);

		previewImages = new Array(images?.groupPictureURL.length).fill('');
	}

	loadGroupPictures();
</script>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<div class="flex flex-row justify-between">
		<h1 class="text-2xl font-semibold mb-3">Group Picture</h1>
	</div>
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
		<div class="overflow-x-auto">
			<div class="flex flex-row justify-between">
				<h2 class="text-xl font-semibold my-2 mx-3">Edit Picture</h2>
				<span class="mx-3 my-2 text-sm">Note: Max of 2 picture</span>
			</div>

			<div class="flex flex-row justify-around py-4">
				{#each images?.groupPictureURL || [] as url, index}
					{#if url !== ''}
						<div class="flex flex-col gap-4">
							<div class="flex flex-col">
								<img src={url} class="h-60 w-72" alt="groupPicture" />
								<div class="flex flex-row gap-2 my-2">
									<button class="btn btn-primary" on:click={() => openImageInput(index)}
										>Change Picture</button
									>
									<button class="btn btn-error text-white" on:click={() => deletePhoto(index)}
										>Delete Photo</button
									>
									<input
										type="file"
										accept="image/*"
										class="hidden"
										id={`imageInput_${index}`}
										on:change={(event) => handleImageChange(event, index)}
									/>
								</div>
							</div>
							<div>
								{#if previewImages[index]}
									<label for="">Selected Photo:</label>
									<img
										class="border border-black rounded-md w-64 h-48 object-cover"
										src={previewImages[index]}
										alt="Selected_Photo"
									/>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<!-- For add Image -->
			{#if previewImage}
				<div class="mx-5 my-2">
					<label for="">Selected Photo:</label>
					<img
						class="border border-black rounded-md w-64 h-48 object-cover"
						src={previewImage}
						alt="Selected_Photo"
					/>
				</div>

				<button on:click={addPicture} class="btn btn-primary">Add</button>
			{/if}

			<!-- For add image! -->

			{#if numberOfEmptyStrings > 0}
				{#if showAddPicture}
					<button on:click={openImage2} class="btn btn-primary mx-5">Add A Picture</button>
					<input
						type="file"
						accept="image/*"
						class="hidden"
						id="imageInput2"
						on:change={handleImageChange2}
					/>{:else}
					<button on:click={openImage2} class="btn btn-primary">Change Picture</button>
					<input
						type="file"
						accept="image/*"
						class="hidden"
						id="imageInput2"
						on:change={handleImageChange2}
					/>
					<button
						on:click={() => ((showAddPicture = !showAddPicture), (previewImage = null))}
						class="btn btn-error text-white">Cancel</button
					>
				{/if}
			{/if}
			<div class="flex flex-row justify-end mt-8 p-3">
				<div class="flex flex-row">
					<button on:click={updatePicture} type="submit" class="btn btn-primary">Save</button>
					<a href="/admin/committee" class="btn btn-error mx-1 text-white">Cancel</a>
				</div>
			</div>
		</div>
	</div>
</div>
