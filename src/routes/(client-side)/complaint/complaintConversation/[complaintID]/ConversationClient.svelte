<script>
	import { userStore } from '$lib/store';
	import { db } from '$lib/firebase/client';
	import {
		getDoc,
		addDoc,
		doc,
		collection,
		serverTimestamp,
		onSnapshot,
		query,
		orderBy
	} from 'firebase/firestore';
	import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';

	export let complaintID;

	const storage = getStorage();

	let messages = [];
	let selectedPictures = [];
	let finalPictures = [];
	let newMessage = '';
	let user = null;

	let unsubscribe = () => {};

	async function getUser() {
		if (!$userStore) {
			return;
		}
		const snapshot = await getDoc(doc(db, 'accounts', $userStore.uid));
		user = snapshot.data();
	}

	async function loadMessages() {
		const convoQuery = query(
			collection(db, 'conversations', complaintID, 'messages'),
			orderBy('timestamp', 'desc')
		);
		try {
			unsubscribe();
			unsubscribe = onSnapshot(convoQuery, (querySnapshot) => {
				messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	async function sendMessage(content, senderId, firstname) {
		if (content === '' && selectedPictures.length === 0) {
			return;
		}
		try {
			if (finalPictures.length > 0) {
				const storageRef = ref(storage, `images/conversation/`);
				const fileUrls = [];

				for (const file of finalPictures) {
					const uniqueId = generateUniqueID(); // Generate a unique ID for each picture
					const fileRef = ref(storageRef, uniqueId);
					const uploadTask = uploadBytes(fileRef, file);

					const snapshot = await uploadTask;
					const downloadURL = await getDownloadURL(snapshot.ref);

					fileUrls.push({ url: downloadURL, name: file.name });
				}

				// Update the committee with the new image URL
				selectedPictures = fileUrls;
			}
		} catch (error) {
			console.error('Error uploading files:', error);
		}
		try {
			const messagesCollectionRef = collection(doc(db, 'conversations', complaintID), 'messages');
			const message = {
				content: content.trim(),
				selectedFiles: selectedPictures,
				senderId,
				firstname,
				timestamp: serverTimestamp()
			};
			const newMessageRef = await addDoc(messagesCollectionRef, message);
			newMessage = '';
			selectedPictures = [];
			finalPictures = [];
			scrollConversationToBottom();
			console.log('Message sent successfully:', newMessageRef.id);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	function handleFileSelect(event) {
		const files = Array.from(event.target.files);

		const readerPromises = files.map((file) => {
			return new Promise((resolve) => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const url = event.target.result;
					resolve({ url, name: file.name });
				};

				reader.readAsDataURL(file);
			});
		});

		Promise.all(readerPromises).then((results) => {
			selectedPictures = results;
			console.log(selectedPictures);
		});

		finalPictures = files; // may error dito pero nagana hahaa
	}

	function generateUniqueID() {
		const timestamp = new Date().getTime();
		const uniqueId = `image_${timestamp}`;

		return uniqueId;
	}

	function scrollConversationToBottom() {
		const conversationContainer = document.getElementById('conversationContainer');
		conversationContainer.scrollTop = conversationContainer.scrollHeight;
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			sendMessage(newMessage, $userStore.uid, user.firstNameDisplay);
		}
	}

	getUser();
	loadMessages();
</script>

<div class="text-gray-700 font-bold mb-2">Conversation:</div>
<div class="flex flex-col-reverse border border-black rounded-md h-96 overflow-y-scroll mb-3">
	{#each messages as convo}
		{#each convo.selectedFiles as picture}
			<div
				class="my-2 flex flex-row overflow-visible {convo.senderId === $userStore?.uid
					? 'justify-end'
					: 'justify-start'} "
			>
				<img src={picture?.url} class="max-w-xs max-h-32 mx-2" alt={picture?.name} />
			</div>
		{/each}
		<div
			class="flex flex-row overflow-visible {convo.senderId === $userStore?.uid
				? 'justify-end'
				: 'justify-start'} "
			style="white-space:pre-wrap"
		>
			{#if convo.content !== ''}<span
					class="p-2 text-white border rounded-md {convo.senderId === $userStore?.uid
						? 'bg-blue-500 mr-2 ml-20 md:ml-56'
						: 'bg-gray-500 ml-2 mr-20 md:mr-56'} my-2"
				>
					{convo.content}
				</span>
			{/if}
		</div>
	{/each}
</div>
<div class="flex flex-row items-end justify-end gap-2">
	{#each selectedPictures as file}
		<div>
			<img src={file.url} alt={file.name} class="max-w-xs max-h-32" />
			<!-- <span>{file.name}</span> -->
		</div>
	{/each}
</div>

<div class="flex flex-col mb-6">
	<form
		on:submit|preventDefault={() => sendMessage(newMessage, $userStore.uid, user.firstNameDisplay)}
		class="flex flex-row gap-3"
	>
		<div class="flex flex-row w-full">
			<textarea
				class="w-full h-10 p-2 resize-none rounded-md scrollbar-none"
				name="message"
				id="noScroll"
				on:keydown={handleKeyDown}
				bind:value={newMessage}
			/>
			<label for="fileInput" class="cursor-pointer">
				<img src="/icon-image.png" class=" ml-2 w-10 h-10" alt="" />
			</label>
			<input
				type="file"
				id="fileInput"
				multiple
				on:change={handleFileSelect}
				class="hidden"
				accept="image/*"
			/>
		</div>
		<button type="submit" class="w-10 h-10"><img src="/icon-sent.png" alt="" /></button>
	</form>
</div>

<style>
	/* Hide the scrollbar */
	#noScroll::-webkit-scrollbar {
		width: 0;
		background-color: #f5f5f5;
	}

	/* textarea::-webkit-scrollbar-thumb {
	  background-color: #000000;
	} */
</style>
