<svelte:head>
	<title>Community - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="flex flex-col md:flex-row p-5">
	<div class="flex flex-col text-justify p-5">
			<h1 class="font-bold text-2xl">About our Neighborhood</h1>
			<p class="py-4">
				At Southview Homes 3, we'll help you turn your vision into a reality. 
				You can enjoy a high standard way of living without putting a strain on your finances.
			</p>
			<p class="py-4">
				The subdivision is a collaborative effort between Allied Community Builders and Development, Inc. and Tradition Homes Project Managers and Development, Inc., it displays contemporary homes with designs that are common for people upgrading their homes and beginning families. 
				The location of this project is in Brgy. San Vicente, San Pedro, Laguna. 
			</p>
			<p class="py-4">
				The location of Southview Homes 3 allows for a very convenient access to all surrounding areas of including schools and shopping complexes, as well as reasonable prices. 
			</p>
	</div>
	<div class="flex flex-col p-5">
		<h1 class="font-bold text-2xl mb-5">Subdivision Map</h1>
			<div class="google-maps">
				<!-- svelte-ignore a11y-missing-attribute -->
				<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3865.389686648378!2d121.03975451484438!3d14.346845589964467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d72eef4c4fc3%3A0xc25dd1803d851577!2sSouthview%20Homes%203!5e0!3m2!1sen!2sph!4v1673783815395!5m2!1sen!2sph" width="600" height="500" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
			</div>
			<style>
				.google-maps {
					position: relative;
    				height: 100%;
    				overflow: hidden;
				}
				.google-maps iframe 
				.google-maps object 
				.google-maps embed {
					position: absolute;
					top: 0;
					left: 0;
					width: 100% !important;
					height: 100% !important;
				}
			  </style>
	</div>	
</div>
<div class="p-5">
	<h1 class="text-2xl font-bold p-3">Community Images</h1>
	<div class="flex flex-col md:flex-row items-center justify-center mx-auto py-3">
		<div class="p-3">
			<img src="/images/grass.jpg" alt="Southview Homes 3 Neighborhood" class="rounded-lg shadow-lg" />
		</div>
		<div class="p-3">
			<img src="/images/street.jpg" alt="Southview Homes 3 Neighborhood" class="rounded-lg shadow-lg" />
		</div>
		<div class="p-3">
			<img src="/images/front.jpg" alt="Southview Homes 3 Neighborhood" class="rounded-lg shadow-lg" />
		</div>
	</div>
</div>
