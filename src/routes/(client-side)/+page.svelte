<script>
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import Committee from './Committee.svelte';
	import toast from 'svelte-french-toast';

	let inquiry = {
		name: '',
		email: '',
		message: ''
	};

	let errors = {};

	async function checkInput() {
		const regex = /^[a-zA-Z -]*$/;
		const nameRegex = inquiry.name.length > 0 && /[a-zA-Z]/.test(inquiry.name);
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		errors = {
			email: !inquiry.email,
			name: !inquiry.name,
			message: !inquiry.message,
			invalidEmail: !emailRegex.test(inquiry.email),
			invalidName: !regex.test(inquiry.name),
			hasNoLetter: !nameRegex,
			messageKulang: inquiry.message.length < 11
		};
		if (Object.values(errors).some((v) => v)) {
			setTimeout(() => {
				errors = {};
			}, 2000);
			return;
		}
		return true;
	}

	async function inquiryHandler() {
		const isValid = await checkInput();
		if (!isValid) {
			toast.error('Form validation failed');
			return;
		}
		try {
			await addDoc(collection(db, 'inquiries'), {
				name: inquiry.name.trim().toLowerCase(),
				nameDisplay: inquiry.name.trim(),
				email: inquiry.email.trim(),
				message: inquiry.message.trim(),
				dateCreated: serverTimestamp(),
				response: '',
				hadAnswered: false
			});
			toast.success('Inquiry sent!');
			inquiry = {
				name: '',
				email: '',
				message: ''
			};
		} catch (error) {
			console.log(error);
			toast.error('Error in sending inquiry!');
		}
	}
</script>

<svelte:head>
	<title>Southview Homes 3 - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<!-- Hero -->
<div class="min-h-[80vh] hero" style="background-image: url(/images/banner.jpg);">
	<div class="hero-overlay bg-opacity-80" />
	<div class="text-center hero-content text-neutral-content">
		<div class="max-w-ct">
			<h2 class="mb-5 text-2xl md:text-5xl font-bold drop-shadow-xl">WELCOME TO</h2>
			<h1 class="mb-10 text-3xl md:text-6xl font-bold">SOUTHVIEW HOMES 3</h1>
		</div>
	</div>
</div>
<!-- end hero -->

<!-- community -->
<div class="hero py-16 bg-base-200 border-y-2">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<img src="/images/house.jpg" class="w-full max-w-md mask mask-circle" alt="housing" />
		<div class="p-8">
			<h1 class="text-5xl font-bold pb-7 text-center lg:text-left">A Welcoming Community</h1>
			<p class="py-6 text-justify">
				Located at the heart of San Pedro, Laguna, Southview Homes 3 not only offers a peaceful and
				an easily accessible neighborhood at an affordable price, but also an organized community
				led with approachable and hardworking people that keep the subdivision in order and
				residents of Southview Homes 3 tightly-knit together.
			</p>
			<a href="/committee" class="btn btn-primary mt-3">Learn More</a>
		</div>
	</div>
</div>
<!-- end committee -->

<!-- photo showcase -->
<div class="flex flex-col md:flex-row w-full pt-7">
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/playground.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Residence"
		/>
	</div>
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/amenities.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Amenities"
		/>
	</div>
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/front_gate.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Front Gate"
		/>
	</div>
</div>
<!-- end showcase -->

<!-- description -->
<div class="flex flex-col md:flex-row py-3 px-8 gap-8">
	<div class="text-justify">
		<h1 class="font-bold text-2xl py-5">About Southview Homes 3</h1>
		<p class="py-4">
			At Southview Homes 3, we'll help you turn your vision into a reality. You can enjoy a high
			standard way of living without putting a strain on your finances.
		</p>
		<p class="py-4">
			The subdivision is a collaborative effort between Allied Community Builders and Development,
			Inc. and Tradition Homes Project Managers and Development, Inc., it displays contemporary
			homes with designs that are common for people upgrading their homes and beginning families.
			The location of this project is in Brgy. San Vicente, San Pedro, Laguna.
		</p>
	</div>
	<div class="text-justify">
		<h1 class="font-bold text-2xl py-5">Amenities and Services</h1>
		<p class="py-4">
			The location of Southview Homes 3 allows for a very convenient access to all surrounding areas
			of including schools, malls and other commercial establishments, as well as reasonable prices
			for renting.
		</p>
		<p class="pt-4">
			Amenities include a perimeter fence surrounding the subdivision, with the main entrance being
			a landscaped gate with a guardhouse in the middle, constantly checking for individuals that
			enter and exit the subdivision. There is also a clubhouse that can be rented as a place to
			host events, playgrounds for leisure time and relaxation, as well as a basketball court to use
			for residents of the subdivision.
		</p>
	</div>
</div>
<!-- end description -->

<p class="divider" />

<!-- map -->
<div class="px-5">
	<!-- <h1 class="font-bold text-2xl pb-7">Location Map</h1> -->
	<div class="google-maps">
		<!-- svelte-ignore a11y-missing-attribute -->
		<iframe
			src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3865.389686648378!2d121.03975451484438!3d14.346845589964467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d72eef4c4fc3%3A0xc25dd1803d851577!2sSouthview%20Homes%203!5e0!3m2!1sen!2sph!4v1673783815395!5m2!1sen!2sph"
			width="100%"
			height="380"
			style="border:0;"
			allowfullscreen=""
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
		/>
	</div>
	<style>
		.google-maps {
			position: relative;
			height: 100%;
			overflow: hidden;
		}
		.google-maps iframe .google-maps object .google-maps embed {
			position: absolute;
			top: 0;
			left: 0;
			width: 100% !important;
			height: 100% !important;
		}
	</style>
</div>
<!-- end map -->

<p class="divider" />

<!-- photo showcase -->
<div class="flex flex-col md:flex-row w-full mb-7">
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/grass.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Neighborhood"
		/>
	</div>
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/street.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Neighborhood"
		/>
	</div>
	<div class="grow h-full px-3 py-8">
		<img
			src="/images/front.jpg"
			class="mx-auto rounded-md shadow-2xl"
			alt="Southview Homes 3 Front Gate"
		/>
	</div>
</div>
<!-- end showcase -->

<!-- clubhouse card -->
<div class="hero py-16 bg-base-200 border-y-2">
	<div class="hero-content flex-col lg:flex-row">
		<img src="/images/clubhouse.jpg" class="w-full max-w-md mask mask-circle" alt="clubhouse" />
		<div class="p-8">
			<h1 class="text-5xl font-bold pb-7 text-center lg:text-left">Clubhouse Renting</h1>
			<p class="py-6 text-justify">
				Southview Homes 3 also offers reservations of its clubhouse facility and surrounding
				amenities for both residents and non-residents. Reservations can include all kinds of events
				- birthdays, debuts, and everything else.
			</p>
			<a href="/reservation" class="btn btn-primary mt-3">Learn More</a>
		</div>
	</div>
</div>
<!-- end clubhouse card -->

<div>
	<Committee/>
</div>

<!-- inquiry -->
<div class="px-5 py-8">
	<div class="text-center">
		<h1 class="text-2xl font-bold pt-8 pb-4">Have an Inquiry?</h1>
		<p class="text-md py-3">Give us a call at 8330-4163 (Landline) or 09063955407 (Mobile).</p>
		<p class="text-md pt-3">
			You can also leave us a message using the form below, or directly contact us at
		</p>
		<a href="mailto:southviewhomes3mail@gmail.com" class="text-md text-blue-700 hover:underline"
			>southviewhomes3mail@gmail.com</a
		>.
	</div>
	<form on:submit|preventDefault={inquiryHandler}>
		<div class="form-control w-full max-w-xl pt-6 pb-4 mx-auto">
			<div class="flex flex-row py-5 gap-3">
				{#if errors.name}
					<p class="text-red-500 text-sm italic mb-1">Name is required</p>
				{:else if errors.invalidName}
					<p class="text-red-500 text-sm italic mb-1">Only letters and '-'</p>
				{:else if errors.hasNoLetter}
					<p class="text-red-500 text-sm italic mb-1">Firstname must have a letter</p>
				{/if}
				<input
					type="text"
					placeholder="Name"
					class="input input-bordered w-full max-w-xs"
					bind:value={inquiry.name}
				/>
				{#if errors.email}
					<p class="text-red-500 text-sm italic mb-1">Email is required</p>
				{:else if errors.invalidEmail}
					<p class="text-red-500 text-sm italic mb-1">Invalid email</p>
				{/if}
				<input
					type="text"
					placeholder="E-mail Address"
					class="input input-bordered w-full max-w-xs"
					bind:value={inquiry.email}
				/>
			</div>
			{#if errors.message}
				<p class="text-red-500 text-sm italic mb-1">Message is required</p>
			{:else if errors.messageKulang}
				<p class="text-red-500 text-sm italic mb-1">Message must be at least 10 characters</p>
			{/if}
			<textarea
				class="textarea textarea-bordered h-32 w-auto"
				placeholder="Message"
				style="resize: none;"
				bind:value={inquiry.message}
			/>
			<button type="submit" class="btn btn-primary my-8">Submit Inquiry</button>
		</div>
	</form>
</div>
<!-- end inquiry -->
