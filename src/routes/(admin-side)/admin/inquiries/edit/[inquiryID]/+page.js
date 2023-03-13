/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    const {inquiryID} = params;
    return {inquiryID};
};