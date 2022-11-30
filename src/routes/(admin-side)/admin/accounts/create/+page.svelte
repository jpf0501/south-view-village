<script>
    import { goto } from '$app/navigation';
    let saveChanges = false;
    let yesChanges = false;

     function openSaveChanges(){
        saveChanges = true;
    }

    function closeSaveChanges(){
        saveChanges = false;
    }

    function openYesChanges(){
        yesChanges = true;
    }
    function closeYesChanges(){
        yesChanges = false;
        goto('/admin/accounts')
    }
</script>


<main>
    <div>
        <div class="grid place-items-center py-10">
            <div class="w-11/12  bg-white">
                <div>
                    <h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Add User</h1>
                </div>
                <form action="" class="p-10">
                        <div class="">
                            <label for="">First Name</label>
                            <input type="text"placeholder="firstname">
                            <label for="">Last Name</label>
                            <input type="text" placeholder="lastname">                       
                        </div>
                        <div>
                            <label for="">Email Address</label>
                            <input type="text" placeholder="email">
                        </div>
                        <div>
                            <label for="">Block</label>
                            <input type="text" placeholder="Block">
                            <label for="">Lot</label>
                            <input type="text" placeholder="Lot">
                            <label for="">Street</label>
                            <input type="text" placeholder="Street">
                            <label for="">Contact No.</label>
                            <input type="number" placeholder="Contact No.">
                            <label for="">Role</label>
                            <select>
                                <option value="">Admin</option>
                                <option value="">Resident</option>
                            </select>
                        </div>
                        <div class="">
                            <label for="">New Password</label>
                            <input type="text" placeholder="New Password">
                            <label for="">Confirm Password</label>
                            <input type="text" placeholder="Confirm Password">
                        </div>
                        <div class="flex justify-between">
                            <button on:click|preventDefault={openSaveChanges} class="bg-blue-500 px-10 py-2 text-white">Save</button>
                            <button on:click|preventDefault={closeYesChanges} class="bg-red-500 px-10 py-2 text-white">Cancel</button>
                        </div>
                </form>
            </div>  
        </div>
    </div>
</main>


{#if saveChanges == true}
<div class="fixed inset-0  grid place-items-center">
    <main class="flex justify-between items-start w-1/6 h-1/6 bg-white border-4 border-black">
        <div class="">
            <p>Do you want to save changes</p>
            <div class="flex place-items-center">
                    <button on:click={openYesChanges} class="border-2 border-black">Yes</button>
                    <button on:click={closeSaveChanges} class="border-2 border-black">Cancel</button>
            </div>         
        </div>
        <button on:click={closeSaveChanges} class="bg-red-500">Close</button>
    </main>
</div>
{/if}

{#if yesChanges == true}
<div class="fixed inset-0  grid place-items-center">
    <main class="flex justify-between items-start w-1/6 h-1/6 bg-white border-4 border-black">
        <div>
            <button on:click={closeYesChanges} class="bg-red-500"> close</button>
            <p>Added User Successfuly</p>
        </div>    
    </main>
</div>
{/if}