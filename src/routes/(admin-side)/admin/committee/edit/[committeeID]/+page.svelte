<script>
	import { db } from '$lib/firebase/client';
	import { getDoc, updateDoc, doc } from 'firebase/firestore';
	import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
	import { addLog } from '$lib/logs';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import Confirmation from '../../../../../../lib/Components/Confirmation.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const { committeeID } = data;

	const storage = getStorage();

	const noPhotoURL =
		'https://firebasestorage.googleapis.com/v0/b/svh3-web.appspot.com/o/images%2Fcommittees%2Fno_picture.jpg?alt=media&token=7485bb89-ddc2-431d-b9dc-20050a2d8b6e';

	let committee = null;
	let errors = {};

	let newImageFile = null;
	let previewImage = '';
	let confirmation = false;
	let confirmationText;
	let handleWhat

	function handleUpdateCommittee() {
		confirmation = true;
		handleWhat = "Update"
		confirmationText = 'Do you want to save changes?';
	}

	function handleDeletePhoto(){
		confirmation = true;
		handleWhat = "Delete"
		confirmationText = 'Do you want to remove photo?';
	}

	async function confirmSubmit() {
		confirmation = false; 
		if(handleWhat === 'Update'){
			await updateCommittee()
		} else if(handleWhat === 'Delete'){
			await deletePhoto()
		}
		
	}

	async function cancelSubmit() {
		confirmation = false; 
	}

	function handleImageChange(event) {
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

	async function getCommittee() {
		const snapshot = await getDoc(doc(db, 'committee', committeeID));
		committee = snapshot.data();
	}

	async function checkInput() {
		errors = {
			firstname: !committee.firstnameDisplay,
			lastname: !committee.lastnameDisplay,
			position: !committee.position
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function updateCommittee() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		// Update the committee data
		committee.firstname = committee.firstnameDisplay.trim().toLowerCase();
		committee.lastname = committee.lastnameDisplay.trim().toLowerCase();

		try {
			// Upload the new image file if selected
			if (newImageFile) {
				const storageRef = ref(storage, `images/committees/${committeeID}`);
				const uploadTask = uploadBytes(storageRef, newImageFile);

				const snapshot = await uploadTask;
				const downloadURL = await getDownloadURL(snapshot.ref);

				// Update the committee with the new image URL
				committee.imageURL = downloadURL;
			}

			// Update the committee details in the Firestore database
			await updateDoc(doc(db, 'committee', committeeID), committee);
			addLog(`"Update the ${committee.position} profile"`, "Committee")
			toast.success('Committee details updated!');
			await goto('/admin/committee');
		} catch (error) {
			console.log(error);
			toast.error('Error in updating committee!');
		}
	}

	async function deletePhoto() {
		try {
			const committeeRef = doc(db, 'committee', committeeID);
			const data = {
				imageURL: noPhotoURL
			};
			await updateDoc(committeeRef, data);
			addLog(`"Remove photo of ${committee.position}"`, "Committee")
			toast.success('Photo has been deleted!');
			await goto('/admin/committee/edit/' + committeeID);
		} catch (error) {
			console.log(error);
			toast.error('Error in deleting photo!');
		}
	}

	getCommittee();
</script>

<svelte:head>
	<title>Edit Committee - Southview Homes 3 Admin Panel</title>
</svelte:head>

<Confirmation show={confirmation} onConfirm={confirmSubmit} onCancel={cancelSubmit} {confirmationText}/>

{#if committee}
	<div class="min-h-screen hero bg-base-200">
		<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
			<h1 class="text-2xl pb-8">Edit Committee</h1>
			<h2 class="text-xl mb-8">Position: <strong>{committee.position}</strong></h2>
			<form class="flex flex-col gap-4">
				<div class="form-control grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex flex-col">
						<span class="pb-3">First Name</span>
						{#if errors.firstname}
							<p class="text-red-500 text-sm italic mb-1">First Name is required</p>
						{/if}
						<input
							type="text"
							class="input input-bordered p-3 mt-2"
							bind:value={committee.firstnameDisplay}
						/>
					</div>
					<div class="flex flex-col">
						<span class="pb-3">Last Name</span>
						{#if errors.lastname}
							<p class="text-red-500 text-sm italic mb-1">Last Name is required</p>
						{/if}
						<input
							type="text"
							class="input input-bordered p-3 mt-2"
							bind:value={committee.lastnameDisplay}
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="flex flex-col gap-4 items-center">
						<label for="">Current Photo:</label>
						<img
							class="border border-black rounded-md w-64 h-48 object-cover	"
							src={committee.imageURL}
							alt={committee.position}
						/>
					</div>
					<div class="flex flex-col gap-4 items-center">
						{#if previewImage}
							<label for="">Selected Photo:</label>
							<img
								class="border border-black rounded-md w-64 h-48 object-cover"
								src={previewImage}
								alt="Selected_Photo"
							/>
						{/if}
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="flex flex-row justify-center gap-5 w-full">
						<button class="btn btn-primary" on:click={openImageInput}>Change Picture</button>
						<input
							type="file"
							accept="image/*"
							class="hidden"
							id="imageInput"
							on:change={handleImageChange}
						/>

						<button class="btn btn-error text-white" type="button" on:click={handleDeletePhoto}
							>Remove Photo</button
						>
					</div>
				</div>

				<!-- <div class="mt-6 grid grid-cols-2">
					<div class="form-control ">
						<span class="pb-3">Position</span>
						{#if errors.position}
							<p class="text-red-500 text-sm italic mb-1">Position is required</p>
						{/if}
						<select bind:value={committee.position}>
							<option value="President">President</option>
							<option value="Vice President">Vice President</option>
							<option value="Secretary">Secretary</option>
							<option value="Treasurer">Treasurer</option>
							<option value="Covenant and Grievances Committee"
								>Covenant and Grievances Committee</option
							>
							<option value="Sports and Wellness Committee">Sports and Wellness Committee</option>
							<option value="Maintenance and Beautification Committee"
								>Maintenance and Beautification Committee</option
							>
							<option value="Community Awareness Committee">Community Awareness Committee</option>
							<option value="Social Events Committee">Social Events Committee</option>
						</select>
					</div>
				</div> -->
				<div class="flex justify-end mt-8">
					<button on:click={handleUpdateCommittee} type="submit" class="btn btn-primary"
						>Save</button
					>
					<a href="/admin/committee" class="btn btn-error mx-1 text-white">Cancel</a>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- No Picture link -->
<!-- https://firebasestorage.googleapis.com/v0/b/svh3-web.appspot.com/o/images%2Fcommittees%2Fno_picture.jpg?alt=media&token=7485bb89-ddc2-431d-b9dc-20050a2d8b6e -->
