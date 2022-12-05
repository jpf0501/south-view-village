<script>
    import { goto } from '$app/navigation';

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

    async function submitHandler(){
        try {
            if(password != passwordcheck){
                throw "Passwords do not match";
            }
            console.log(email);
            console.log(password);
            console.log(passwordcheck);
            console.log(firstname);
            console.log(lastname);
            console.log(addressBlock);
            console.log(addressLot);
            console.log(addressStreet);
            console.log(contactNumber);
            console.log(role);
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
                            <input type="text"placeholder="First Name" required bind:value={firstname}>
                            <label for="">Last Name</label>
                            <input type="text" placeholder="Last Name" required bind:value={lastname}>                       
                        </div>
                        <div>
                            <label for="">Email Address</label>
                            <input type="email" placeholder="Email" required bind:value={email}>
                        </div>
                        <div>
                            <label for="">Block</label>
                            <input type="number" placeholder="Block" required bind:value={addressBlock}>
                            <label for="">Lot</label>
                            <input type="number" placeholder="Lot" required bind:value={addressLot}> 
                            <label for="">Street</label>
                            <input type="text" placeholder="Street" required bind:value={addressStreet}>
                            <label for="">Contact No.</label>
                            <input type="text" pattern="[09][0-9]{9}" maxlength="11" placeholder="Contact No." required  bind:value={contactNumber}>
                            <label for="">Role</label>
                            <select bind:value={role}>                               
                                <option value="">Resident</option>
                                <option value="">Admin</option>
                            </select>
                        </div>
                        <div class="">
                            <label for="">Password</label>
                            <input type="password" placeholder="Password" required bind:value={password}>
                            <label for="">Confirm Password</label>
                            <input type="password" placeholder="Confirm Password" required bind:value={passwordcheck}>
                            {#if password != passwordcheck && passwordcheck != ""}
                                <p class="text-red-500">Password doesnt match</p>
                            {/if}
                        </div>
                        <div class="flex justify-between">
                            <button type="submit" class="bg-blue-500 px-10 py-2 text-white">Save</button>
                            <a href="/admin/accounts" class="bg-red-500 px-10 py-2 text-white">Cancel</a>
                        </div>
                </form>
            </div>  
        </div>
    </div>
</main>


