<script>
	import { onSnapshot, query, collection, snapshotEqual } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { onDestroy } from 'svelte';

	let listOfBooking = [];

	const bookingQuery = query(collection(db, 'booking'));
	const unsubscribe = onSnapshot(bookingQuery, (querySnapshot) => {
		listOfBooking = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	});
	onDestroy(() => unsubscribe());
</script>

<main>
	<div>
		<div>
			<h1 class="text-3xl font-bold mt-5 mb-16 ml-5">Booking</h1>
		</div>
		<div>
			<div class="px-10 py-5">
				<table class="border-2 border-black w-full">
					<thead>
						<tr class="font-bold bg-gray-500">
							<th class="text-left text-base">Name</th>
							<th class="text-left text-base">Email Address</th>
							<th class="text-left text-base">Contact No.</th>
                            <th class="text-left text-base">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each listOfBooking as book}
							<tr class="text-base text-center border-t-2 border-black">
								<td class="text-left text-base bg-gray-300">{book.name}</td>
								<td class="text-left text-base bg-gray-300">{book.email}</td>
								<td class="text-left text-base bg-gray-300">{book.contact}</td>
                                <td class="text-left text-base bg-gray-300">{book.status}</td>
                                <button class="py-2 px-10 bg-green-500">Approve</button>
                                <button class="py-2 px-10 bg-red-500">Dissaprove</button>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</main>