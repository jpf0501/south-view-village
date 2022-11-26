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