/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    // console.log(params);
    const {newsID} = params;
    return {newsID};
};