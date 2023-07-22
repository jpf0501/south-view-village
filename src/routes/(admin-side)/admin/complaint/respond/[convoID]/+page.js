/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    const {convoID} = params;
    return {convoID};
};