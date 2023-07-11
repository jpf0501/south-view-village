<script>
	import { getDocs, query, collection, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import PreviousOfficers from './PreviousOfficers.svelte';

	let currentOfficers = [];
	let currentCommittees = [];

	const officerPositions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor'];
	const committeePositions = [
		'Covenant and Grievances Committee',
		'Sports and Wellness Committee',
		'Maintenance and Beautification Committee',
		'Community Awareness Committee',
		'Social Events Committee'
	];

	async function getCurrentOfficers() {
		const officerPromises = officerPositions.map(async (position) => {
			const officersQuery = query(
				collection(db, 'committee'),
				where('position', '==', position),
				where('isCurrentOfficer', '==', true)
			);
			const officersSnapshot = await getDocs(officersQuery);

			if (!officersSnapshot.empty) {
				const { firstnameDisplay, lastnameDisplay } = officersSnapshot.docs[0].data();
				const id = officersSnapshot.docs[0].id;
				return { id, position, firstname: firstnameDisplay, lastname: lastnameDisplay };
			}
		});

		currentOfficers = await Promise.all(officerPromises);
	}

	async function getCurrentCommittees() {
		const committeePromises = committeePositions.map(async (position) => {
			const committeesQuery = query(
				collection(db, 'committee'),
				where('position', '==', position),
				where('isCurrentOfficer', '==', true)
			);
			const committeesSnapshot = await getDocs(committeesQuery);

			if (!committeesSnapshot.empty) {
				const committeeMembers = committeesSnapshot.docs.map((doc) => {
					const { firstnameDisplay, lastnameDisplay } = doc.data();
					const id = doc.id;
					return { id, firstname: firstnameDisplay, lastname: lastnameDisplay };
				});

				return { position, members: committeeMembers };
			}
		});

		currentCommittees = await Promise.all(committeePromises);
	}

	getCurrentOfficers();
	getCurrentCommittees();
</script>

<svelte:head>
	<title>Commmittee - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<div class="flex flex-row justify-between">
		<h2 class="text-2xl font-semibold mb-3">Committee</h2>
		<a href="/admin/committee/new-committees" class="btn btn-primary">Change All Committees</a>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
		<div>
			{#await currentOfficers}
				<p>Loading...</p>
			{:then officersData}
				{#if officersData.length > 0}
					<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
						<div class="overflow-x-auto">
							<table class="table w-full">
								<thead>
									<tr>
										<th colSpan={3} class="text-lg text-center">List of Officers</th>
									</tr>
								</thead>
								<tbody>
									{#each officersData as officer}
										<tr class="hover">
											<td class="font-bold">{officer.position}:</td>
											<td>{officer.firstname + ' ' + officer.lastname}</td>
											<td
												><a
													href={'/admin/committee/edit/' + officer.id}
													class="btn glass text-white"
													><svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														><path
															d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
														/></svg
													></a
												></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					<!-- <ul
						class="text-xl flex flex-col gap-4 shadow-2xl border border-black rounded-md bg-white"
					>
						{#each officersData as officer}
							<li class="flex flex-row gap-5 hover:bg-gray-200 p-2">
								<span class="w-48 font-semibold">{officer.position}:</span>
								<ul class="flex flex-row justify-between w-full">
									<li class="w-1/3">{officer.firstname}</li>
									<li>{officer.lastname}</li>
									<li>
										<a href={'/admin/committee/edit/' + officer.id} class="btn glass text-white"
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
									</li>
								</ul>
							</li>
						{/each}
					</ul> -->
				{:else}
					<p>Loading.</p>
				{/if}
			{/await}
		</div>
		<div>
			{#await currentCommittees}
				<p>Loading...</p>
			{:then committeesData}
				{#if committeesData.length > 0}
					<div class="w-full mx-auto shadow-2xl border rounded-xl bg-base-100 my-5">
						<div class="overflow-x-auto">
							<table class="table w-full">
								<thead>
									<tr>
										<th colSpan={3} class="text-lg text-center">List of Committees</th>
									</tr>
								</thead>
								<tbody>
									{#each committeesData as committee}
										<tr>
											<th>{committee.position}:</th>
										</tr>
										{#each committee.members as member}
											<tr class="hover">
												<td>{member.firstname + ' ' + member.lastname}</td>
												<td
													><a
														href={'/admin/committee/edit/' + member.id}
														class="btn glass text-white"
														><svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															><path
																d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
															/></svg
														></a
													></td
												>
											</tr>
										{/each}
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- <ul
						class="text-xl flex flex-col gap-4 shadow-2xl border border-black rounded-md bg-white "
					>
						{#each committeesData as committee}
							<li class="flex flex-col ">
								<span class="font-semibold">{committee.position}:</span>
								{#each committee.members as member}
									<ul class="flex flex-row justify-between w-full p-2 hover:bg-gray-200">
										<li class="w-1/3">{member.firstname}</li>
										<li>{member.lastname}</li>
										<li>
											<a href={'/admin/committee/edit/' + member.id} class="btn glass text-white"
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
										</li>
									</ul>
								{/each}
							</li>
						{/each}
					</ul> -->
				{:else}
					<p>Loading...</p>
				{/if}
			{/await}
		</div>
	</div>
	<div>
		<PreviousOfficers />
	</div>
</div>
