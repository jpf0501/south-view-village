/** @type {import('./$types').PageLoad} */
export async function load({params}) {
    // console.log(params);
    const {userID} = params;
    return {userID};
};