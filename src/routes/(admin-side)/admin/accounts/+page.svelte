<script>

    let user = {
        name: 'Michael Angelo',
        address: '12 Blk 2 Lot 3',
        email: 'michael@yahoo.com',
        role: 'Admin',
        status: 'Paid'
    };
    let listOfUsers = [
        {
            user
        },
        {
            user
        },{
            user
        },
        
    ];
</script>


<main>
    <div class="my-5 mx-12">
        <div >
            <h1 class="text-3xl font-bold my-4">Accounts</h1>
        </div>
         <div class="flex justify-between m-3">
            <h1 class="px-1 text-xl font-semibold">Users</h1>
            <input type="search" placeholder="Search here">
            <a class="px-1 text-base bg-blue-400 rounded-full hover:bg-blue-800 flex items-center border-blue-700" href="/admin/accounts/create">Add User</a>
         </div>
         <div>
            <table class="border-2 border-black ">
                <thead>
                    <tr class=" px-5 font-bold text-xl">
                        <th class="py-2 pr-28 text-left bg-pink-200">Name</th>
                        <th class="py-2 px-32 text-left bg-orange-200">Address</th>
                        <th class="py-2 px-28 text-left bg-yellow-200">Email</th>
                        <th class="py-2 px-10 text-left bg-lime-200">Role</th>
                        <th class="py-2 px-10 text-left bg-cyan-200">Status</th>
                    </tr>
                </thead>
               <tbody>  
                    {#each listOfUsers as item}
                    <tr class="text-base" value={item.user}>
                        <td class="py-2 pr-28 text-left bg-blue-200" >{user.name}</td>
                        <td class="py-2 px-32 text-left bg-red-200">{user.address}</td>
                        <td class="py-2 px-28 text-left bg-green-200">{user.email}</td>
                        <td class="py-2 px-10 text-center">{user.role}</td>
                        <td class="py-2 px-10 text-center text-green-400">{user.status}</td>
                        <a class="py-2 px-10" href="/admin/accounts">Edit</a>
                    </tr>
                    {/each}
               </tbody>
            </table>
         </div>
        
    </div>
</main> 

 




