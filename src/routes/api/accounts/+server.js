import { error, json } from '@sveltejs/kit';
import { adminAuth } from '$lib/firebase/admin.server';

// /** @type {import('./$types').RequestHandler} */
// export async function GET() {
//     return new Response("asdasd");
// };

// /** @type {import('./$types').RequestHandler} */
// export async function POST({ request }) {
//     console.log(request);
//     console.log("Post successfully");
//     return new Response("Post successfully");
// };

export async function POST({ request }) {
	try {
        const createUserRequest = await request.json();
        console.log(createUserRequest);
        // const userRecord = await adminAuth.createUser({ email:createUserRequest.email, password:createUserRequest.password });
		// return json(userRecord);
        return json({name: "rodel"})
	} catch (err) {
		console.log(err);
		throw error(400, err);
	}
}