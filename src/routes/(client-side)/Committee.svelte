<script>
	import { getCurrentCommittees } from '$lib/getCommittee.js';
	// import { getStorage, ref, getDownloadURL } from 'firebase/storage';

	// const storage = getStorage();
	// const storageRef = ref(storage, 'images/committees/president.jpg');

	// let imageUrl;

	let president = [];
	let vicePresident = [];
	let secretary = [];
	let treasurer = [];
	let auditor = [];
	let convennant = [];
	let sports = [];
	let maintenanceAndBeautification = [];
	let communityAwareness = [];
	let socialEvents = [];

	async function loadCommittees() {
		president = await getCurrentCommittees('President', true);
		vicePresident = await getCurrentCommittees('Vice President', true);
		secretary = await getCurrentCommittees('Secretary', true);
		treasurer = await getCurrentCommittees('Treasurer', true);
		auditor = await getCurrentCommittees('Auditor', true);
		convennant = await getCurrentCommittees('Covenant and Grievances Committee', true);
		sports = await getCurrentCommittees('Sports and Wellness Committee', true);
		maintenanceAndBeautification = await getCurrentCommittees(
			'Maintenance and Beautification Committee',
			true
		);
		communityAwareness = await getCurrentCommittees('Community Awareness Committee', true);
		socialEvents = await getCurrentCommittees('Social Events Committee', true);

		// imageUrl = await getDownloadURL(storageRef);
		// console.log(imageUrl)
	}

	loadCommittees();
</script>

<svelte:head>
	<title>Committee - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="mx-auto">
	
	<h1 class="font-bold text-3xl pt-14 px-8 pb-5">Home Owners Association</h1>
</div>

<!-- head -->
<div class="flex flex-col items-center m-5">
	<div class="flex flex-col md:flex-row">
		<div class="m-3">
			<img
				src="/images/committee/group_photo_1.jpg"
				alt="Southview Homes 3 Home Owners Association"
				class="rounded-lg md:scale-90 shadow-2xl"
			/>
		</div>
		<div class="m-3">
			<img
				src="/images/committee/group_photo_2.jpg"
				alt="Southview Homes 3 Home Owners Association"
				class="rounded-lg md:scale-90 shadow-2xl"
			/>
		</div>
	</div>
</div>

<div class="px-14 pt-3 pb-7 text-justify">
	<p class="pb-8">
		The Homeowners Association (HOA) of Southview Homes 3 is responsible for overseeing the
		management and administration of the subdivision. The HOA also serves as a point of contact for
		both residents and non-residents who have inquiries or concerns about the subdivision. This
		includes responding to requests for information about the community, as well as addressing
		complaints or issues raised by residents. In addition to handling inquiries, they are also
		responsible in handling the budget of the subdivision, which is used to cover the cost of
		various services and amenities provided to the community.
	</p>
	<p>
		The HOA is also responsible for creating guidelines and rules for the subdivision, which are
		designed to promote safety, security, and the overall well-being of the community. These
		guidelines may include rules related to parking, noise levels, and exterior property
		maintenance, among other things. They are also serving as the community leaders and main
		organizers for community events and activities. They coordinate and plan events such as holiday
		celebrations, subdivision-wide pet vaccinations, sports competitions, bazaars, and other
		community gatherings, fostering a sense of community and social interaction among the residents
		of Southview Homes 3.
	</p>
</div>
<!-- end head -->

<p class="divider" />

<!-- main committee -->
<div class="mx-auto">
	<h1 class="font-bold text-3xl pt-8 px-8">List of Officers</h1>
</div>
<div class="m-5">
	<div class="flex flex-col">
		<div class="flex flex-col md:flex-row items-center justify-center">
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img src={president[0]?.imageURL} alt="President" class="mask mask-circle " />
					<h2 class="font-bold text-center text-2xlp pt-6">
						{`${president[0]?.firstnameDisplay} ${president[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">President</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img src={vicePresident[0]?.imageURL} alt="Vice President" class="mask mask-circle " />
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${vicePresident[0]?.firstnameDisplay} ${vicePresident[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Vice President</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img src={secretary[0]?.imageURL} alt="Secretary" class="mask mask-circle " />
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${secretary[0]?.firstnameDisplay} ${secretary[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Secretary</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col md:flex-row items-center justify-center">
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img src={treasurer[0]?.imageURL} alt="Treasurer" class="mask mask-circle " />
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${treasurer[0]?.firstnameDisplay} ${treasurer[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Treasurer</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img src={auditor[0]?.imageURL} alt="Auditor" class="mask mask-circle " />
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${auditor[0]?.firstnameDisplay} ${auditor[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Auditor</p>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- end main committee -->

<p class="divider" />

<!-- branches -->
<div class="mx-auto">
	<h1 class="font-bold text-3xl pt-8 px-8">Heads of Committees</h1>
</div>
<div class="m-5">
	<div class="flex flex-col">
		<div class="flex flex-col md:flex-row items-center justify-center">
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={convennant[0]?.imageURL}
						alt="Covenant and Grievances Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${convennant[0]?.firstnameDisplay} ${convennant[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Covenant and Grievances Committee</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={convennant[1]?.imageURL}
						alt="Covenant and Grievances Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${convennant[1]?.firstnameDisplay} ${convennant[1]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Covenant and Grievances Committee</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={sports[0]?.imageURL}
						alt="Sports and Wellness Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${sports[0]?.firstnameDisplay} ${sports[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Sports and Wellness Committee</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={sports[1]?.imageURL}
						alt="Sports and Wellness Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${sports[1]?.firstnameDisplay} ${sports[1]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Sports and Wellness Committee</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col md:flex-row items-center justify-center mb-10">
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={maintenanceAndBeautification[0]?.imageURL}
						alt="Maintenance and Beautification Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${maintenanceAndBeautification[0]?.firstnameDisplay} ${maintenanceAndBeautification[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Maintenance and Beautification Committee</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={communityAwareness[0]?.imageURL}
						alt="Community Awareness Committee"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${communityAwareness[0]?.firstnameDisplay} ${communityAwareness[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Community Awareness Committee</p>
				</div>
			</div>
			<div class="card w-96 bg-base-100 shadow-xl m-5">
				<div class="card-body">
					<img
						src={socialEvents[0]?.imageURL}
						alt="Social Events Committee<"
						class="mask mask-circle "
					/>
					<h2 class="font-bold text-center text-2xl pt-6">
						{`${socialEvents[0]?.firstnameDisplay} ${socialEvents[0]?.lastnameDisplay}`}
					</h2>
					<p class="text-center mx-auto pt-4">Social Events Committee</p>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- end branches -->
<div class="pb-7" />
