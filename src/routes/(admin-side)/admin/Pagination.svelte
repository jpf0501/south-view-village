<script>
	export let currentPage;
	export let totalPages;
	export let onPageChange;

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	};
</script>

<div class="flex justify-center items-center">
	<nav class="block mb-8">
		<ul class="flex pl-0 rounded list-none flex-wrap gap-2">
			{#if currentPage > 1}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight bg-white rounded-md border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage - 1)}
					>
						Previous
					</button>
				</li>
			{/if}

			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				{#if page === currentPage}
					<li>
						<button
							class="relative block py-2 px-3 rounded-md leading-tight bg-blue-700 text-white hover:bg-blue-500 focus:bg-blue-500"
							>{page}</button
						>
					</li>
				{:else if (page >= currentPage - 2 && page <= currentPage + 2) || page === totalPages || page === 1}
					<li>
						<button
							class="relative block py-2 px-3 leading-tight rounded-md bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
							on:click={() => goToPage(page)}
						>
							{page}
						</button>
					</li>
				{:else if page === currentPage - 3 || page === currentPage + 3}
					<li>
						<span
							class="relative block py-2 px-3 leading-tight bg-white rounded-md border border-gray-300 text-blue-700"
							>...</span
						>
					</li>
				{/if}
			{/each}

			{#if currentPage < totalPages}
				<li>
					<button
						class="relative block py-2 px-3 leading-tight rounded-md bg-white border border-gray-300 text-blue-700 hover:bg-gray-200 focus:bg-gray-200"
						on:click={() => goToPage(currentPage + 1)}
					>
						Next
					</button>
				</li>
			{/if}
		</ul>
	</nav>
</div>
