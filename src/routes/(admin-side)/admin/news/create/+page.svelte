<script>
	import { db } from '$lib/firebase/client';
	import { addDoc, collection } from 'firebase/firestore';
	import { goto } from '$app/navigation';

    let title = '';
    let content = '';
    let date = '';
    let time = '';

    async function submitHandler() {
		try {
			await addDoc(collection(db, 'news'), {
                title: title,
                content: content,
                date: date,
                time: time,
            });
            // console.log(title);
            // console.log(content);
            // console.log(date);
            // console.log(time);
			alert('News entry created');
			await goto('/admin/news');
		} catch (error) {
			console.log(error);
			alert('Error updating');
		}
	}

</script>

    <div>
        <div class="grid place-items-center py-10">
            <div class="w-11/12">
                <div>
                    <h1 class="text-xl font-bold bg-gray-300 px-1 py-3">Add News</h1>              
                </div>
                <form on:submit|preventDefault={submitHandler}>
                    <div class="">
                        <label for="title">Title</label>
                        <br>
                        <input type="text" class="w-1/2" required bind:value={title}> 
                    </div>   
                    <div >
                        <label for="content">Content</label>
                        <br>
                        <textarea class="h-60 w-5/6" required bind:value={content}></textarea>
                    </div>            
                    <div >
                        <label for="date">Date</label>
                        <br>
                        <!-- Temporary -->
                        <input type="text" class="w-1/2" required bind:value={date}>
                        <!-- Temporary -->
                    </div> 
                    <div >
                        <label for="time">Time</label>
                        <br>
                        <!-- Temporary -->
                        <input type="text" class="w-1/2" required bind:value={time}>
                        <!-- Temporary -->
                    </div> 
                    <div class="grid place-items-center my-10">
                        <div class="flex gap-5">
                            <button type="submit" class="bg-blue-500 px-10 py-2">Submit</button>
                            <a href="/admin/news" class="bg-red-500 px-10 py-2">Cancel</a>
                        </div>          
                    </div>
                </form>     
            </div>         
        </div>
    </div> 