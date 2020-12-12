const fetch = require('node-fetch');

function checkOtpValid(user) {
	// All in seconds
	const currentTime = Date.now() / 1000;
	const lastUpdate = Number(user.verification.updatedAt) / 1000;
	const timeLimit = 60;
	return currentTime - lastUpdate < timeLimit;
}

function sendOtp(mobileNo, otp) {
	const raw = JSON.stringify({
		to: `91${String(mobileNo)}`,
		content: `OTP for signing into student companion is ${otp}`,
		from: 'SMSINFO',
	});

	const requestOptions = {
		method: 'POST',
		headers: {
			Authorization: 'Basic d2J0cDU4NjA6dDViSmEycWE=',
			'Content-Type': 'application/json',
		},
		body: raw,
		redirect: 'follow',
	};

	fetch('https://rest-api.d7networks.com/secure/send', requestOptions)
		.then((response) => response.text())
		.then((result) => console.log(result))
		.catch((error) => console.log('error', error));
}

module.exports = { checkOtpValid, sendOtp };
