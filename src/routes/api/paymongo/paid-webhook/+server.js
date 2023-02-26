import { addDoc, updateDoc, doc, collection } from 'firebase/firestore'
import { db } from '$lib/firebase/client';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response('hello');
};

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    const body = await request.json()
    await addDoc(collection(db, 'paymongo'), body)
    const paymentDesc = body.data.attributes.data.attributes.description
    const paymentMethod = body.data.attributes.data.attributes.attributes.type
    const bookID = body.data.attributes.data.attributes.remarks
    if (paymentDesc == 'Clubhouse Reservation Downpayment') {
        await updateDoc(doc(db, 'booking', bookID), {paymentStatus: 'Paid'})
    } else {
        await updateDoc(doc(db, 'accounts', bookID), {paymentStatus: 'Paid'})
        const docRef = doc(db, 'accounts', bookID);
        const docSnapshot = await getDoc(docRef)
        const user = docSnapshot.data()
        await addDoc(collection(db, 'payment'), {
			firstName: user.firstname,
			firstNameDisplay: user.firstNameDisplay,
			lastName: user.lastname,
			lastNameDisplay: user.lastNameDisplay,
			paymentMethod: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
			contact: user.contactNumber,
			email: user.email,
			addressBlock: user.addressBlock,
			addressLot: user.addressLot,
			addressStreet: user.addressStreet,
			paymentTime: serverTimestamp()
		})
    }
    return new Response();
};