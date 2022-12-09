<script>
    import { db } from "$lib/firebase/client"
    import { getDoc, updateDoc, doc } from "firebase/firestore";
    import { goto } from "$app/navigation"

    /** @type {import('./$types').PageData} */
    export let data;
    const {userID} = data

    let user = null;

    async function getUser() {
        const snapshot = await getDoc(doc(db, "accounts", userID))
        user = snapshot.data()
    }
    getUser()

    async function updateUser() {
        // console.log(user);
        try {
            await updateDoc(doc(db, "accounts", userID), user)
            alert("User info updated");
        } catch (error) {
            console.log(error);
            alert("Error updating");
        }
    }

    async function deleteUser() {
        try {
            await fetch("/api/accounts/", {method:"DELETE", body:JSON.stringify({ uid:userID })})
            await goto("/admin/accounts")
            alert("Deleted successfully");
        } catch (error) {
            console.log(error);
            alert("Delete error");
        }
    }

</script>
<h1>{userID}</h1>
{#if user}
    <!-- <h1>{ JSON.stringify(user) }</h1> -->
    <input type="text" bind:value={user.firstname} />
    <input type="text" bind:value={user.lastname} />
    <input type="text" bind:value={user.addressBlock} />
    <input type="text" bind:value={user.addressLot} />
    <input type="text" bind:value={user.addressStreet} />
    <input type="text" bind:value={user.contactNumber} />
    <input type="text" bind:value={user.role} />
    <button on:click={updateUser}>Save</button>
    <button on:click={deleteUser} class="py-2 px-10">Delete</button>
{/if}