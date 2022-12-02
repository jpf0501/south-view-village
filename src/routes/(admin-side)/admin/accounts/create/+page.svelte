<script>
    import { goto } from '$app/navigation';
    // let saveChanges = false;
    // let yesChanges = false;

   
    let email = "";
    let password = "";
    let passwordcheck = "";
    let firstname = "";
    let lastname = "";
    let addressBlock = "";
    let addressLot = "";
    let addressStreet = "";
    let contactNumber = "";
    let role = "";


    //  function openSaveChanges(){
    //     saveChanges = true;
    // }

    // function closeSaveChanges(){
    //     saveChanges = false;
    // }

    // function openYesChanges(){
    //     yesChanges = true;
    // }
    // async function closeYesChanges(){
    //     yesChanges = false;
    //     saveChanges = false;
    //     await goto('/admin/accounts')
    // }

    async function submitHandler(){
        try {
            if(password != passwordcheck){
                throw "Passwords do not match";
            }
            // console.log(email);
            // console.log(password);
            // console.log(passwordcheck);
            // console.log(firstname);
            // console.log(lastname);
            // console.log(addressBlock);
            // console.log(addressLot);
            // console.log(addressStreet);
            // console.log(contactNumber);
            // console.log(role);
            const response = await fetch('/api/accounts', {
			method: 'POST',
			body: JSON.stringify({ email, password })
        
		})
            const result = await response.json();
            console.log(result);

            alert("Save success");
        } catch (error) {
            console.log(error);
            alert(error);
        }
        
    }
</script>


<main>
    <div>
        <div class="grid place-items-center py-10">
            <div class="w-11/12  bg-white">
                <div>
                    <h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Add User</h1>
                </div>
                <form 
                on:submit|preventDefault={submitHandler}
                 class="p-10">
                        <div class="">
                            <label for="">First Name</label>
                            <input type="text"placeholder="firstname" required bind:value={firstname}>
                            <label for="">Last Name</label>
                            <input type="text" placeholder="lastname" required bind:value={lastname}>                       
                        </div>
                        <div>
                            <label for="">Email Address</label>
                            <input type="email" placeholder="email" required bind:value={email}>
                        </div>
                        <div>
                            <label for="">Block</label>
                            <input type="text" placeholder="Block" required bind:value={addressBlock}>
                            <label for="">Lot</label>
                            <input type="text" placeholder="Lot" required bind:value={addressLot}> 
                            <label for="">Street</label>
                            <input type="text" placeholder="Street" required bind:value={addressStreet}>
                            <label for="">Contact No.</label>
                            <input type="number" placeholder="Contact No." required bind:value={contactNumber}>
                            <label for="">Role</label>
                            <select bind:value={role}>
                                <option value="Admin">Admin</option>
                                <option value="Resident">Resident</option>
                            </select>
                        </div>
                        <div class="">
                            <label for="">Password</label>
                            <input type="password" placeholder="New Password" required bind:value={password}>
                            <label for="">Confirm Password</label>
                            <input type="password" placeholder="Confirm Password" required bind:value={passwordcheck}>
                            {#if password != passwordcheck && passwordcheck != ""}
                                <p class="text-red-500">Password doesnt match</p>
                            {/if}
                        </div>
                        <div class="flex justify-between">
                            <button type="submit" class="bg-blue-500 px-10 py-2 text-white">Save</button>
                            <a class="bg-red-500 px-10 py-2 text-white" href="/admin/accounts">Cancel</a>
                        </div>
                </form>
            </div>  
        </div>
    </div>
</main>


<!-- {#if saveChanges == true}
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
{/if} -->