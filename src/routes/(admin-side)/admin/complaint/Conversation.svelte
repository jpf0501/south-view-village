<script>
	let conversation = ["Kamusta ka?sasasasasasasasasasasa  saasasas aasasasa as a sasasas asas aas sa asas saa s as	sasasaasas", "Okay lang ikaw ba?", "Hello","Kamusta ka?sasasasasasasasasasasa  saasasas aasasasa as a sasasas asas aas sa asas saa s as	sasasaasas", "Okay lang ikaw ba?","Okay lang din","Nice Nice", "Ehh bakit?"];
</script>

<div class="text-gray-700 font-bold mb-2">Conversation:</div>
<div id="noScroll" class="flex flex-col border-l border-r border-t border-black rounded-md h-56 overflow-y-scroll">
	{#each conversation as convo, i}     
            <div class="flex flex-row {i % 2 === 1 ? 'justify-start' : 'justify-end'} ">
                <span class="bg-blue-500 p-2 text-white border rounded-md {i % 2 === 1? 'ml-2 mr-20 md:mr-56':'mr-2 ml-20 md:ml-56'} my-2">{convo}</span>
            </div>            
    {/each}
</div>

<div class="flex flex-col mb-6">
	<div class="flex flex-row">
		<div class="flex-grow">
			<textarea
				class="w-full h-10 p-2 resize-none rounded-md scrollbar-none"
				name="message"
				id="noScroll"
			/>
		</div>
		<button class="px-4 py-2 bg-blue-500 text-white border rounded-lg">Send</button>
	</div>
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
