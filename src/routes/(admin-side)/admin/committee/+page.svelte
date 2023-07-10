<script>
	import { getDocs, query, collection, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';

	let officers = [];
	let committees = [];

	const officerPositions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor'];
	const committeePositions = [
		'Covenant and Grievances Committee',
		'Sports and Wellness Committee',
		'Maintenance and Beautification Committee',
		'Community Awareness Committee',
		'Social Events Committee'
	];

	async function getOfficers() {
		const officerPromises = officerPositions.map(async (position) => {
			const officersQuery = query(collection(db, 'committee'), where('position', '==', position));
			const officersSnapshot = await getDocs(officersQuery);

			if (!officersSnapshot.empty) {
				const { firstnameDisplay, lastnameDisplay } = officersSnapshot.docs[0].data();
				const id = officersSnapshot.docs[0].id;
				return { id, position, firstname: firstnameDisplay, lastname: lastnameDisplay };
			}
		});

		officers = await Promise.all(officerPromises);
	}

	async function getCommittees() {
		const committeePromises = committeePositions.map(async (position) => {
			const committeesQuery = query(collection(db, 'committee'), where('position', '==', position));
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

		committees = await Promise.all(committeePromises);
	}

	getOfficers();
	getCommittees();
</script>

<svelte:head>
	<title>Commmittee - Southview Homes 3 Admin Panel</title>
</svelte:head>

<div class="min-w-full min-h-full bg-base-200 py-8 px-5">
	<h1 class="text-3xl font-semibold py-2 mb-3">Committee</h1>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
		<div>
			<h2 class="text-2xl font-semibold mb-3">List of Officers</h2>
			{#await officers}
				<p>Loading...</p>
			{:then officersData}
				{#if officersData.length > 0}
					<ul
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
					</ul>
				{:else}
					<p>No officer/s found.</p>
				{/if}
			{/await}
		</div>
		<div>
			<h2 class="text-2xl font-semibold mb-3">Head of Committees</h2>
			{#await committees}
				<p>Loading...</p>
			{:then committeesData}
				{#if committeesData.length > 0}
					<ul
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
					</ul>
					<!-- {:else}
					<p>No Committee/s found.</p> -->
				{/if}
			{/await}
		</div>
	</div>
</div>
