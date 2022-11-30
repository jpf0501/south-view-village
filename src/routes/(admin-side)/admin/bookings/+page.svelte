<script>
    let book = {
        id: 1,
        bookedBy: 'Michael Angelo',
        date: '12/5/2022',
        time: '8:00 AM - 11:00AM',
        payStatus: 'Paid'
    }
    let listOfBooks = [
        {
            book
        },
        {
            book
        }
        
    ];
</script>

<main>
    <div>
        <div>
            <h1 class="text-3xl font-bold mt-5 mb-16 ml-5">Booking</h1>
        </div>
        <div class="flex justify-end mr-12 mb-5">
            <input type="search" placeholder="Search here"></div>
        <div>
            <table>
                <table class="border-2 border-black ">
                    <thead>
                        <tr class=" px-5 font-bold text-xl">
                            <th class="py-2 pr-28 text-left bg-pink-200">ID</th>
                            <th class="py-2 px-32 text-left bg-orange-200">Booked by</th>
                            <th class="py-2 px-28 text-left bg-yellow-200">Date</th>
                            <th class="py-2 px-10 text-left bg-lime-200">Time</th>
                            <th class="py-2 px-10 text-left bg-cyan-200">Pay</th>
                        </tr>
                    </thead>
                   <tbody>  
                        {#each listOfBooks as item}
                        <tr class="text-base" value={item.book}>
                            <td class="py-2 pr-28 text-left bg-blue-200" >{book.id}</td>
                            <td class="py-2 px-32 text-left bg-red-200">{book.bookedBy}</td>
                            <td class="py-2 px-28 text-left bg-green-200">{book.date}</td>
                            <td class="py-2 px-10 text-center">{book.time}</td>
                            <td class="py-2 px-10 text-center text-green-400">{book.payStatus}</td>
                            <button class="py-2 px-10 bg-green-500">Approve</button>
                            <button class="py-2 px-10 bg-red-500">Dissaprove</button>
                        </tr>
                        {/each}
                   </tbody>
                </table>
            </table>
        </div>
    </div>
</main>