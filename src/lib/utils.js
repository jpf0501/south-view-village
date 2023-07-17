import { PUBLIC_PAYMONGO_SECRET_KEY } from '$env/static/public'
import { getCountFromServer } from 'firebase/firestore';

export const sendEmail = async (
	mailOptions = {
		to: 'dngumayagay@gmail.com',
		subject: 'Email Subject',
		html: '<h1>Hello World</h1>'
	}
) =>
	await (
		await fetch('/api/send-email', {
			method: 'POST',
			body: JSON.stringify({ mailOptions })
		})
	).json();

	export async function createPaymentLink (description = 'Clubhouse Reservation Downpayment', amount = '', remarks = '') {
		const options = {
			method: 'POST',
			headers: {
			  accept: 'application/json',
			  'content-type': 'application/json',
			  authorization: 'Basic ' + PUBLIC_PAYMONGO_SECRET_KEY,
			},
			body: JSON.stringify({
			  data: {
				attributes: {
				  amount: amount,
				  description: description,
				  remarks: remarks
				}
			  }
			})
		  };
		  try {
			const response = await fetch('https://api.paymongo.com/v1/links', options)
			const result = await response.json()  
			return result;
		  } catch (error) {
			console.log(error)
		  }
		
	}

export async function getCountSnapshot(query){
	const snapshot = await getCountFromServer(query);
// console.log('count: ', snapshot.data().count);
	return snapshot.data().count
	}