<script>
	export let show;
	export let onConfirm;
	export let onCancel;
	export let confirmationText = 'Are you sure you want to submit it?';
</script>

{#if show}
	<div class="fixed inset-0 flex items-center justify-center z-50">
		<div class="modal-overlay absolute inset-0 bg-black opacity-50"  on:keydown={() => {}} on:click|self={onCancel} />
		<div
			class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto"
		>
			<div class="modal-content py-4 text-left px-6">
				<h1 class="text-2xl mb-4">Confirmation</h1>
				<p class="mb-4">{confirmationText}</p>
				<div class="modal-action flex justify-end">
					<button class="btn btn-primary mr-2" on:click={onConfirm}>Confirm</button>
					<button class="btn" on:click={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	</div>
{/if}
