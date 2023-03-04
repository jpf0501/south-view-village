<script>
    import { db } from '$lib/firebase/client';
	import { getDoc, doc } from 'firebase/firestore';

    const monthName = [
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

<svelte:head>
	<title>News - Official Website of Southview Homes 3 Subdivision</title>
</svelte:head>

{#if news}
<main class="p-8 w-full">
    <div class="pb-10"> 
        <div class="text-md breadcrumbs">
            <ul>
              <li><a href="/" class="hover:underline hover:text-blue-700">Home</a></li> 
              <li><a href="/news" class="hover:underline hover:text-blue-700">News</a></li> 
              <li>{news.titleDisplay}</li>
            </ul>
          </div>
    </div>
    <section class="pb-11">
        <h1 class="text-4xl font-bold pb-5">{news.titleDisplay}</h1>
        <div class="flex items-center mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{news.dateCreated.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})} by Admin | Last Updated {news.dateModified.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</p>
        </div>
        <h1 class="divider">           
        </h1>
        <article class="max-w-7xl text-justify mx-auto" style="white-space:pre-wrap">
            <p class="pt-8">{news.content}</p>
        </article>
    </section>
</main>
{/if}

