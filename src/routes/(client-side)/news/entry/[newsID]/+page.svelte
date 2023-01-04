<script>
    import { db } from '$lib/firebase/client';
	import { getDoc, doc } from 'firebase/firestore';

    /** @type {import('./$types').PageData} */
	export let data;
	const { newsID } = data;

    let news = null;

	async function getNews() {
		const snapshot = await getDoc(doc(db, 'news', newsID));
		news = snapshot.data();
	}

	getNews();

</script>

{#if news}
<main class="p-8 w-full">
    <div class="pb-10"> 
        <a href="/news/" class="gap-2 btn btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
            </svg>Go Back
        </a>
    </div>
    <section class="pb-11">
        <h1 class="text-3xl font-bold pb-5">{news.titleDisplay}</h1>
        <p>Posted on {news.dateCreated.toDate().toLocaleDateString()} at {news.dateCreated.toDate().toLocaleTimeString()} | Last Updated on {news.dateModified.toDate().toLocaleDateString()} at {news.dateModified.toDate().toLocaleTimeString()}</p>
        <h1 class="divider">           
        </h1>
        <article class="max-w-7xl text-justify mx-auto" style="white-space:pre-wrap">
            <p>{news.content.replaceAll("\\n", "\n")}</p>
        </article>
    </section>
</main>
  
    

{/if}

