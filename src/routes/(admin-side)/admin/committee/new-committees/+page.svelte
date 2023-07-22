<script>
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import { updateDoc, doc } from 'firebase/firestore';
	import { getCurrentCommitteesID, getCurrentCommittees } from '$lib/getCommittee';
	import toast from 'svelte-french-toast';
	import FirstnameForm from '$lib/FormComponents/FirstnameForm.svelte';
	import LastnameForm from '$lib/FormComponents/LastnameForm.svelte';

	let currentCommittees = {};
	let previousCommittees = {};
	let currentCommitteeID;
	let previousCommitteeID;

	let newOfficers = {
		President: { firstname: '', lastname: '' },
		'Vice President': { firstname: '', lastname: '' },
		Secretary: { firstname: '', lastname: '' },
		Treasurer: { firstname: '', lastname: '' },
		Auditor: { firstname: '', lastname: '' },
		'Covenant and Grievances Committee 1': { firstname: '', lastname: '' },
		'Covenant and Grievances Committee 2': { firstname: '', lastname: '' },
		'Sports and Wellness Committee 1': { firstname: '', lastname: '' },
		'Sports and Wellness Committee 2': { firstname: '', lastname: '' },
		'Maintenance and Beautification Committee': { firstname: '', lastname: '' },
		'Community Awareness Committee': { firstname: '', lastname: '' },
		'Social Events Committee': { firstname: '', lastname: '' }
	};

	async function loadCommitteesID() {
		const committees = [
			'President',
			'Vice President',
			'Secretary',
			'Treasurer',
			'Auditor',
			'Covenant and Grievances Committee',
			'Sports and Wellness Committee',
			'Maintenance and Beautification Committee',
			'Community Awareness Committee',
			'Social Events Committee'
		];

		currentCommittees = await Promise.all(
			committees.map((committee) => getCurrentCommitteesID(committee, true))
		);
		previousCommittees = await Promise.all(
			committees.map((committee) => getCurrentCommitteesID(committee, false))
		);

		currentCommitteeID = currentCommittees;
		previousCommitteeID = previousCommittees;

		currentCommittees = currentCommittees.reduce((obj, value, index) => {
			obj[committees[index]] = value[0];
			return obj;
		}, {});

		previousCommittees = previousCommittees.reduce((obj, value, index) => {
			obj[committees[index]] = value[0];
			return obj;
		}, {});

		const committeesData = await Promise.all(
			committees.map((committee) => getCurrentCommittees(committee, true))
		);
		committeesData.forEach((data, index) => {
			currentCommittees[committees[index]] = data;
		});
	}

	async function submitHandler() {
		await loadCommitteesID();
		try {
			const updateCommittee = async (committee, currentCommitteeID, previousCommitteeID) => {
				const updateOldCommitteeRef = doc(db, 'committee', previousCommitteeID);
				let holder = committee;

				if (
					committee === 'Covenant and Grievances Committee 1' ||
					committee === 'Covenant and Grievances Committee 2'
				) {
					committee = 'Covenant and Grievances Committee';
				} else if (
					committee === 'Sports and Wellness Committee 1' ||
					committee === 'Sports and Wellness Committee 2'
				) {
					committee = 'Sports and Wellness Committee';
				}

				await updateDoc(updateOldCommitteeRef, {
					firstname: currentCommittees[committee][0].firstname,
					lastname: currentCommittees[committee][0].lastname,
					firstnameDisplay: currentCommittees[committee][0].firstnameDisplay,
					lastnameDisplay: currentCommittees[committee][0].lastnameDisplay,
					isCurrentOfficer: false
				});

				committee = holder;

				const updateCurrentCommitteeRef = doc(db, 'committee', currentCommitteeID);
				await updateDoc(updateCurrentCommitteeRef, {
					firstname: newOfficers[committee].firstname.trim().toLowerCase(),
					lastname: newOfficers[committee].lastname.trim().toLowerCase(),
					firstnameDisplay: newOfficers[committee].firstname.trim(),
					lastnameDisplay: newOfficers[committee].lastname.trim(),
					imageURL:
						'https://firebasestorage.googleapis.com/v0/b/svh3-web.appspot.com/o/images%2Fcommittees%2Fno_picture.jpg?alt=media&token=7485bb89-ddc2-431d-b9dc-20050a2d8b6e',
					isCurrentOfficer: true
				});
			};
			await Promise.all([
				updateCommittee('President', currentCommitteeID[0][0], previousCommitteeID[0][0]),
				updateCommittee('Vice President', currentCommitteeID[1][0], previousCommitteeID[1][0]),
				updateCommittee('Secretary', currentCommitteeID[2][0], previousCommitteeID[2][0]),
				updateCommittee('Treasurer', currentCommitteeID[3][0], previousCommitteeID[3][0]),
				updateCommittee('Auditor', currentCommitteeID[4][0], previousCommitteeID[4][0]),
				updateCommittee(
					'Covenant and Grievances Committee 1',
					currentCommitteeID[5][0],
					previousCommitteeID[5][0]
				),
				updateCommittee(
					'Covenant and Grievances Committee 2',
					currentCommitteeID[5][1],
					previousCommitteeID[5][1]
				),
				updateCommittee(
					'Sports and Wellness Committee 1',
					currentCommitteeID[6][0],
					previousCommitteeID[6][0]
				),
				updateCommittee(
					'Sports and Wellness Committee 2',
					currentCommitteeID[6][1],
					previousCommitteeID[6][1]
				),
				updateCommittee(
					'Maintenance and Beautification Committee',
					currentCommitteeID[7][0],
					previousCommitteeID[7][0]
				),
				updateCommittee(
					'Community Awareness Committee',
					currentCommitteeID[8][0],
					previousCommitteeID[8][0]
				),
				updateCommittee(
					'Social Events Committee',
					currentCommitteeID[9][0],
					previousCommitteeID[9][0]
				)
			]);

			toast.success('Committees have been changed!');
			await goto('/admin/committee');
		} catch (error) {
			console.log(error);
			toast.error('Error in changing committees!');
		}
	}
</script>

<svelte:head>
	<title>New Committees - Southview Homes 3 Admin Panel</title>
</svelte:head>

<main>
	<form on:submit|preventDefault={submitHandler}>
		<div class="min-h-screen hero bg-base-200 py-8">
			<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="">
						<div class="mt-2">
							<h1 class="text-2xl">New Officers</h1>
						</div>
						<div>
							<div class="my-2">
								<span class="font-bold">President: </span>
							</div>
							<div class="grid grid-cols-2 gap-6 ">
								<FirstnameForm bind:value={newOfficers.President.firstname}/>
								<LastnameForm bind:value={newOfficers.President.lastname}/>
							</div>
							<div class="my-2">
								<span class="font-bold">Vice President: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Vice President'].firstname}/>
								<LastnameForm bind:value={newOfficers['Vice President'].lastname}/>
							</div>
							<div class="my-2">
								<span class="font-bold">Secretary: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers.Secretary.firstname}/>
								<LastnameForm bind:value={newOfficers.Secretary.lastname}/>
							</div>
							<div class="my-2">
								<span class="font-bold">Treasurer: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers.Treasurer.firstname}/>
								<LastnameForm bind:value={newOfficers.Treasurer.lastname}/>
							</div>
							<div class="my-2">
								<span class="font-bold">Auditor: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers.Auditor.firstname}/>
								<LastnameForm bind:value={newOfficers.Auditor.lastname}/>
							</div>
						</div>
					</div>

					<!-- ---------------------------  New  Committee -------------------------------------------------------- -->
					<div class="">
						<div class="mt-2">
							<h1 class="text-2xl">New Committees</h1>
						</div>
						<div>
							<div class="my-4">
								<span class="font-bold">Covenant and Grievances Committee: </span>
							</div>
							<div class="grid grid-cols-2 gap-6 ">
								<FirstnameForm bind:value={newOfficers['Covenant and Grievances Committee 1'].firstname}/>
								<LastnameForm bind:value={newOfficers['Covenant and Grievances Committee 1'].lastname}/>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Covenant and Grievances Committee 2'].firstname}/>
								<LastnameForm bind:value={newOfficers['Covenant and Grievances Committee 2'].lastname}/>
							</div>
							<div class="my-4">
								<span class="font-bold">Sports and Wellness Committee: </span>
							</div>
							<div class="grid grid-cols-2 gap-6 ">
								<FirstnameForm bind:value={newOfficers['Sports and Wellness Committee 1'].firstname}/>
								<LastnameForm bind:value={newOfficers['Sports and Wellness Committee 1'].lastname}/>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Sports and Wellness Committee 2'].firstname}/>
								<LastnameForm bind:value={newOfficers['Sports and Wellness Committee 2'].lastname}/>
							</div>
							<div class="my-4">
								<span class="font-bold">Maintenance and Beautification Committee: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Maintenance and Beautification Committee'].firstname}/>
								<LastnameForm bind:value={newOfficers['Maintenance and Beautification Committee'].lastname}/>
							</div>
							<div class="my-4">
								<span class="font-bold">Community Awareness Committee: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Community Awareness Committee'].firstname}/>
								<LastnameForm bind:value={newOfficers['Community Awareness Committee'].lastname}/>
							</div>
							<div class="my-4">
								<span class="font-bold">Social Events Committee: </span>
							</div>
							<div class="grid grid-cols-2 gap-6">
								<FirstnameForm bind:value={newOfficers['Social Events Committee'].firstname}/>
								<LastnameForm bind:value={newOfficers['Social Events Committee'].lastname}/>
							</div>
						</div>
					</div>
				</div>
				<div class="flex justify-end mt-8">
					<button type="submit" class="btn btn-primary mx-1 px-6">Submit</button>
					<a href="/admin/committee" class="btn btn-error mx-1 px-4 text-white">Cancel</a>
				</div>
			</div>
		</div>
	</form>
</main>
