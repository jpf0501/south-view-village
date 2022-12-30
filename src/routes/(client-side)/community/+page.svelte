<svelte:head>
	<title>Community - Official Website of Southview Homes 3 Village</title>
</svelte:head>

<main class="grid w-full max-w-5xl grid-cols-2 gap-8 p-8 mx-auto">
	<section class="">
		<!--  -->
		<article class="flex flex-col gap-4">
			<h1 class="text-xl">About our neighborhood</h1>
			<p class="px-4">
				At Southview Homes 3, we'll help you turn your vision into a reality. 
				You can enjoy a high standard way of living without putting a strain on your finances.
			</p>
			<p class="px-4">
				The subdivision is a collaborative effort between Allied Community Builders and Development, Inc. and Tradition Homes Project Managers and Development, Inc., it displays contemporary homes with designs that are common for people upgrading their homes and beginning families. 
				The location of this project is in Brgy. San Vicente, San Pedro, Laguna. 
			</p>
			<p class="px-4">
				The location of Southview Homes 3 allows for a very convenient access to all surrounding areas of including schools and shopping complexes, as well as reasonable prices. 
			</p>
		</article>
	</section>
	<section class="">
		<h1 class="text-xl">About our neighborhood</h1>
		<div class="mapouter">
			<div class="gmap_canvas">
				<!-- svelte-ignore a11y-missing-attribute -->
				<iframe
					width="600"
					height="500"
					id="gmap_canvas"
					src="https://maps.google.com/maps?q=san%20pedro%20laguna%20ph&t=k&z=13&ie=UTF8&iwloc=&output=embed"
					frameborder="0"
					scrolling="no"
					marginheight="0"
					marginwidth="0"
				/>
				<!-- svelte-ignore a11y-missing-content -->
				<a href="https://putlocker-is.org" /><br /><style>
					.mapouter {
						position: relative;
						text-align: right;
						height: 500px;
						width: 600px;
					}
				</style><a href="https://www.embedgooglemap.net">google embed map</a><style>
					.gmap_canvas {
						overflow: hidden;
						background: none !important;
						height: 500px;
						width: 600px;
					}
				</style>
			</div>
		</div>
		<!--  -->
	</section>
</main>
