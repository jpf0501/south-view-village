<script>
	import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';
	import Pagination from '../Pagination.svelte';

	let listOfInquiry = [];
	let sortByField = '';
	let searchByField = '';
	let searchByValue = '';
	let inquiryQuery = query(collection(db, 'inquiries'), where('hadAnswered', '==', false));

	let noResult = false;

	let currentPage = 1;
	let pageSize = 10;
	let totalRecords = 1;
	let totalPages = 0;

	async function getInquiries(inquiryQuery, page, pageSize) {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const unsubscribe = onSnapshot(inquiryQuery, (querySnapshot) => {
			listOfInquiry = querySnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() }))
				.slice(startIndex, endIndex);
		});
		onDestroy(() => unsubscribe());
	}

	async function changeSortBy() {
		inquiryQuery = query(
			collection(db, 'inquiries'),
			where('hadAnswered', '==', false),
			orderBy(sortByField, 'asc')
		);
	}

	async function searchInquiries() {
		let searchByValueCase = searchByValue.toLowerCase();
		if (searchByValue == '') {
			inquiryQuery = query(collection(db, 'inquiries'), where('hadAnswered', '==', false));
		} else {
			inquiryQuery = query(
				collection(db, 'inquiries'),
				where(searchByField, '>=', searchByValueCase),
				where(searchByField, '<=', searchByValueCase + '~'),
				where('hadAnswered', '==', false)
			);
		}
	}

	async function resetButton() {
		inquiryQuery = query(collection(db, 'inquiries'), where('hadAnswered', '==', false));
		searchByValue = '';
	}

	$: {
		getInquiries(inquiryQuery, currentPage, pageSize);
		const unsubscribe = onSnapshot(inquiryQuery, (querySnapshot) => {
			totalRecords = querySnapshot.docs.length;
			totalPages = Math.ceil(totalRecords / pageSize);
		});
		listOfInquiry.length === 0 ? (noResult = true) : (noResult = false);
		onDestroy(() => unsubscribe());
	}
	function goToPage(page) {
		currentPage = page;
	}
</script>

<svelte:head>
	<title>Inquiries - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2">Inquiries</h1>
	<div class="flex flex-col md:flex-row justify-between">
		<div class="flex flex-col md:flex-row">
			<form
				on:submit|preventDefault={searchInquiries}
				class="my-4 flex flex-col md:flex-row items-start"
			>
				<select
					bind:value={searchByField}
					class="select select-bordered mb-2 md:mb-0 md:mr-2"
					required
				>
					<option value="" disabled selected>Search Filter</option>
					<option value="name">Name</option>
					<option value="email">Email</option>
					<!-- <option value="dateCreated">Date Created</option>
					<option value="dateModified">Last Updated</option> -->
				</select>
				<input
					type="search"
					placeholder="Search here"
					bind:value={searchByValue}
					class="input input-bordered"
				/>
			</form>
			<button on:click={resetButton} class="btn btn-primary my-4 mx-2">Reset</button>
		</div>

		<select bind:value={sortByField} on:change={changeSortBy} class="select select-bordered my-4">
			<option value="" disabled selected>Sort By</option>
			<option value="name">Name</option>
			<option value="email">Email</option>
		</select>
	</div>

	<!-- Medium to large screen -->
	<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5 hidden md:block">
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th />
						<th class="text-lg">Name</th>
						<th class="text-lg">Email</th>
						<th class="text-lg">Inquiry</th>
						<!-- <th class="text-lg">Date Inquired</th> -->
						<th />
					</tr>
				</thead>
				{#if noResult}
					<tr>
						<td class="py-24 text-center" colspan="8">No Inquiries Found</td>
					</tr>
				{/if}
				<tbody>
					{#each listOfInquiry as inquiry, i}
						<tr class="hover">
							<td>{i + (currentPage - 1) * pageSize + 1}</td>
							<td>{inquiry.nameDisplay}</td>
							<td>{inquiry.email}</td>
							<td>{inquiry.message.substring(0, 50) + '...'}</td>
							<!-- <td
								>{inquiry.dateCreated
									.toDate()
									.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
									' at ' +
									inquiry.dateCreated
										.toDate()
										.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</td
							> -->
							<td>
								<a href={'/admin/inquiries/edit/' + inquiry.id} class="btn glass text-white"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										><path
											d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
										/></svg
									></a
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Small screen -->
	<div class="flex flex-col py-8 items-center justify-center mx-auto space-y-3 md:hidden">
		{#if noResult}
			<div class="w-full mx-auto">No Inquiries Found</div>
		{/if}
		{#each listOfInquiry as inquiry}
			<div class="card w-[105%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-2">{inquiry.nameDisplay}</h2>
					<div>
						<span class="my-1 font-bold">Email: </span>
						{inquiry.email}
					</div>
					<div>
						<span class="my-1 font-bold">Inquiry: </span>
						{inquiry.message.substring(0, 30) + '...'}
					</div>
					<!-- <div>
						<span class="my-1 font-bold">Date Inquired:</span>
						{inquiry.dateCreated
							.toDate()
							.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' }) +
							' at ' +
							inquiry.dateCreated
								.toDate()
								.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
					</div> -->
					<div class="card-actions justify-end">
						<a href={'/admin/inquiries/edit/' + inquiry.id} class="btn glass text-white"
							><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
								/></svg
							></a
						>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-14">
		<Pagination {currentPage} {totalPages} onPageChange={goToPage} />
	</div>
</div>
