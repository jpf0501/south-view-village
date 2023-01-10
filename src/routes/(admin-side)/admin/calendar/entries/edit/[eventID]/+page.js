/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    // console.log(params);
    const {eventID} = params;
    return {eventID};
};