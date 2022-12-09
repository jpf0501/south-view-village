import { error, json } from '@sveltejs/kit';
import { adminAuth } from '$lib/firebase/admin.server';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '$lib/firebase/client.js';

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
        // console.log(createUserRequest);
        const userRecord = await adminAuth.createUser({ email:createUserRequest.email, password:createUserRequest.password });
		await setDoc(doc(db, "accounts", userRecord.uid), { 
			firstname:createUserRequest.firstname, 
			lastname:createUserRequest.lastname, 
			addressBlock:createUserRequest.addressBlock,
			addressLot:createUserRequest.addressBlock,
			addressStreet:createUserRequest.addressStreet,
			contactNumber:createUserRequest.contactNumber,
            role:createUserRequest.role,
		 })
		// return json(userRecord);
		// console.log(userRecord);
        return json({ uid:userRecord.uid })
	} catch (err) {
		console.log(err);
		throw error(400, err);
	}
}