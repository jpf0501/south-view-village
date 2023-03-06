<svelte:head>
	<title>Community - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="flex flex-col md:flex-row py-3 px-5 gap-8">
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
		<h1 class="font-bold text-2xl py-5">Amenities and Features</h1>
		<p class="py-4">
			The location of Southview Homes 3 allows for a very convenient access to all surrounding areas
			of including schools, malls and other commercial establishments, as well as reasonable prices for renting.
		</p>
		<p class="pt-4">
			Amenities include a perimeter fence surrounding the subdivision, with the main entrance being a 
			landscaped gate with a guardhouse in the middle, constantly checking for individuals that enter 
			and exit the subdivision. There is also a clubhouse that can be rented as a place to host events, 
			playgrounds for leisure time and relaxation, as well as a basketball court to use for residents 
			of the subdivision.
		</p>
	</div>
</div>
<p class="divider px-5"></p>
<div class="px-5">
	<h1 class="font-bold text-2xl pb-7">Location Map</h1>
	<div class="google-maps">
		<!-- svelte-ignore a11y-missing-attribute -->
		<iframe
			src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3865.389686648378!2d121.03975451484438!3d14.346845589964467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d72eef4c4fc3%3A0xc25dd1803d851577!2sSouthview%20Homes%203!5e0!3m2!1sen!2sph!4v1673783815395!5m2!1sen!2sph"
			width=100%
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
<p class="divider px-5 pt-5"></p>
<div class="px-5 py-3">
	<h1 class="text-2xl font-bold pb-3">Community Images</h1>
	<div class="flex flex-col md:flex-row items-center justify-center mx-auto gap-3 py-3">
		<div class="pt-3">
			<img
				src="/images/grass.jpg"
				alt="Southview Homes 3 Neighborhood"
				class="rounded-lg shadow-lg"
			/>
		</div>
		<div class="pt-3">
			<img
				src="/images/street.jpg"
				alt="Southview Homes 3 Neighborhood"
				class="rounded-lg shadow-lg"
			/>
		</div>
		<div class="pt-3">
			<img
				src="/images/front.jpg"
				alt="Southview Homes 3 Neighborhood"
				class="rounded-lg shadow-lg"
			/>
		</div>
	</div>
</div>
<p class="divider px-5"></p>

<!-- inquiry -->
<div class="px-5 py-3">
	<div class="text-center">
		<h1 class="text-2xl font-bold pb-4">Have an Inquiry?</h1>
		<p class="text-md py-3">Give us a call at 8330-4163 (Landline) or 09063955407 (Mobile).</p>
		<p class="text-md pt-3">You can also leave us a message using the form below, or directly contact us at </p>
		<a href="mailto:southviewhomes3mail@gmail.com"class="text-md text-blue-700 hover:underline">southviewhomes3mail@gmail.com</a>.
	</div>
	<form on:submit|preventDefault={() => console.log('Submitted')}>
		<div class="form-control w-full max-w-xl pt-6 pb-4 mx-auto">
			<div class="flex flex-row py-5 gap-3">
				<input type="text" placeholder="Name" class="input input-bordered w-full max-w-xs" required />
				<input type="text" placeholder="E-mail Address" class="input input-bordered w-full max-w-xs" required />
			</div>
			<textarea class="textarea textarea-bordered h-32 w-auto" placeholder="Message" style="resize: none;" required></textarea>
			<button type="submit" class="btn btn-primary my-8">Submit Message</button>
		</div>
	</form>
</div>
<!-- end inquiry -->

