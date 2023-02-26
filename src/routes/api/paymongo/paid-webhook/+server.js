import { addDoc, updateDoc, doc, collection } from 'firebase/firestore'
import { db } from '$lib/firebase/client';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response('hello');
};

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    const body = await request.json()
    // console.log(body)
    await addDoc(collection(db, 'paymongo'), body)
    const paymentDesc = body.data.attributes.data.attributes.description
    // const paymentMethod = body.data.attributes.data.attributes.attributes.source.type
    const bookID = body.data.attributes.data.attributes.remarks
    if (paymentDesc == 'Clubhouse Reservation Downpayment') {
        await updateDoc(doc(db, 'booking', bookID), {paymentStatus: 'Paid'})
    } else {
        await updateDoc(doc(db, 'accounts', bookID), {paymentStatus: 'Paid'})
    }
    return new Response();
};