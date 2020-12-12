const auth = require('express').Router();
const otpGenerator = require('otp-generator');
const User = require('../models/User.js');
const { checkOtpValid, sendOtp } = require('../helpers/otp');
const { createJWTtoken } = require('../helpers/jwt');

auth.post('/otpinit', async (req, res) => {
	try {
		const { mobileNo } = req.body;
		if (!mobileNo)
			return res.status(400).json({ message: 'Enter mobile number' });
		const otp = otpGenerator.generate(6, {
			upperCase: false,
			specialChars: false,
			alphabets: false,
		});
		console.log(otp);

		let existingUser = await User.findOne({ mobileNo: req.body.mobileNo });
		console.log(existingUser);
		if (existingUser == null) {
			console.log('gds');
			existingUser = await User.create({
				mobileNo,
				verification: {
					otp,
					updatedAt: new Date(),
				},
			});
			await sendOtp(mobileNo, otp);
			return res
				.status(200)
				.json({ message: 'OTP Sent', exist: existingUser.register });
		}
		if (checkOtpValid(existingUser)) {
			return res
				.status(208)
				.json({ message: 'wait for 59 seconds to Resend OTP' });
		}
		const update = {
			otp,
			updatedAt: new Date(),
		};
		await User.findOneAndUpdate(
			{ mobileNo },
			{ verification: update },
			{ useFindAndModify: false }
		);
		await sendOtp(mobileNo, otp);
		console.log(':OTP SENT:');
		return res
			.status(200)
			.json({ message: 'OTP Sent', exist: existingUser.register });
	} catch (e) {
		console.log(e);
		return res.status(500).json({ message: 'Try again later' });
	}
});

auth.post('/login', async (req, res) => {
	try {
		const { mobileNo, otp } = req.body;
		if (!mobileNo || !otp) {
			return res.status(400).json({ message: 'Fill all fields' });
		}
		const user = await User.findOne({ mobileNo });
		if (user == null) {
			return res.status(404).json({ message: 'User not found' });
		}
		if (!user.registered) {
			return res.status(404).json({ register: true });
		}
		if (otp === user.verification.otp && checkOtpValid(user)) {
			const token = await createJWTtoken(user);
			return res.status(200).json({
				message: 'Success',
				token,
			});
		}
		console.log(otp, user.verification.otp, checkOtpValid(user));

		if (otp !== user.verification.otp && checkOtpValid(user)) {
			return res.status(400).json({ message: 'Invalid OTP' });
		}
		return res.status(403).json({ message: 'OTP expired' });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: 'server error. try again later' });
	}
});

auth.post('/register', async (req, res) => {
	try {
		console.log(req.body);
		const { mobileNo, name, uname, otp } = req.body;
		if (!mobileNo || !name || !uname) {
			return res.status(400).json({ message: 'Fill all fields' });
		}
		const user = await User.findOne({ mobileNo });
		console.log(user.verification.otp, otp);
		if (user.name)
			return res.status(409).json({ message: 'User already exists' });
		if (user == null) {
			return res.status(404).json({ message: 'User not found.' });
		}

		if (otp === user.verification.otp && checkOtpValid(user)) {
			user.name = name;
			user.mobileNo = mobileNo;
			user.uname = uname;
			user.registered = true;
			await user.save();

			const token = await createJWTtoken(user);
			return res.status(200).json({
				message: 'Success',
				token,
			});
		}
		if (otp !== user.verification.otp && checkOtpValid(user)) {
			return res.status(400).json({ message: 'Invalid OTP' });
		}
		return res.status(403).json({ message: 'OTP expired' });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: 'server error. try again later' });
	}
});

module.exports = auth;
