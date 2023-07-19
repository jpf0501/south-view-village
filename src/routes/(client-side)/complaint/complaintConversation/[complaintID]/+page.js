/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    const {complaintID} = params;
    return {complaintID};
};