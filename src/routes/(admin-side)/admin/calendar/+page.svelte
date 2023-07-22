<script>
	import DayButton from './DayButton.svelte';
	import { Modal } from 'svelte-simple-modal';

	const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	let date = new Date();
	let currentYear = date.getFullYear();
	let currentMonth = date.getMonth() + 1;
	$: daysInCurrentMonth = getHowManyDaysInAMonth(currentYear, currentMonth);
	$: dayOfTheWeekOfTheFirstDayOfTheMonth = getDayOfTheWeekOfTheFirstDayOfTheMonth(
		currentYear,
		currentMonth
	);
	const previousMonth = () => {
		currentMonth -= 1;
		if (currentMonth < 1) {
			currentMonth = 12;
			currentYear -= 1;
		}
	};
	const nextMonth = () => {
		currentMonth += 1;
		if (currentMonth > 12) {
			currentMonth = 1;
			currentYear += 1;
		}
	};

	const getHowManyDaysInAMonth = (year, month) => new Date(year, month, 0).getDate();
	const getDayOfTheWeekOfTheFirstDayOfTheMonth = (year, month) =>
		new Date(year, month - 1, 1).getDay();
</script>

<svelte:head>
	<title>Event Calendar - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

<div class="flex flex-col gap-4 py-8">
	<div class="flex justify-end py-1">
		<div class="flex items-center">
			<span class="h-2 w-2 square-full mr-2 bg-blue-500" />
			<span class="text-sm font-medium text-gray-500">Bookings</span>
		</div>
		<div class="flex items-center ml-6">
			<span class="h-2 w-2 square-full mr-2 bg-green-500" />
			<span class="text-sm font-medium text-gray-500">Events</span>
		</div>
		<div class="flex items-center ml-6">
			<span class="h-2 w-2 square-full mr-2 bg-red-500" />
			<span class="text-sm font-medium text-gray-500">Bookings and Events</span>
		</div>
	</div>
	<main>
		<section>
			<div class="navbar bg-base-300">
				<div class="navbar-start">
					<button on:click={previousMonth} class="btn btn-circle btn-ghost">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 19.5L8.25 12l7.5-7.5"
							/>
						</svg>
					</button>
				</div>
				<div class="navbar-center">
					<h1 class="text-xl normal-case sm:text-xs">
						{monthNames[currentMonth - 1]}
						{currentYear}
					</h1>
				</div>
				<div class="navbar-end">
					<button on:click={nextMonth} class="btn btn-circle btn-ghost">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				</div>
			</div>
			<main class="grid grid-cols-7">
				{#each daysOfTheWeek as day}
					<button class="py-4 font-medium bg-base-200" disabled>
						{day}
					</button>
				{/each}
				{#each { length: dayOfTheWeekOfTheFirstDayOfTheMonth } as _}
					<button class="border border-collapse aspect-video" />
				{/each}
				{#each { length: daysInCurrentMonth } as _, i}
					<Modal><DayButton dayNumber={i + 1} month={currentMonth} year={currentYear} /></Modal>
				{/each}
			</main>
		</section>
	</main>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto pt-8 pb-5">
		<a href="/admin/calendar/add-event" class="btn btn-primary btn-wide">Add Event in Calendar</a>
		<a href="/admin/calendar/entries" class="btn btn-primary btn-wide">Manage Events</a>
	</div>
</div>
