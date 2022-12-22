<script>
	import { each } from 'svelte/internal';

	const daysOfTheWeek = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
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
	$: console.log(currentMonth);
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

<div class="flex flex-col gap-4 py-8">
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
					<h1 class="text-xl normal-case">{monthNames[currentMonth - 1]} {currentYear}</h1>
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
					<button class="border border-collapse aspect-video">
						{i + 1}
					</button>
				{/each}
			</main>
		</section>
	</main>
	<a href="/calendar/scheduleEvent" class="mx-auto btn btn-primary btn-wide">Schedule an event</a>
</div>
