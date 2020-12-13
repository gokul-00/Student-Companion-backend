const auth = require('express').Router();
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const { checkOtpValid, sendOtp } = require('../helpers/otp');
const { createJWTtoken } = require('../helpers/jwt');

auth.post('/login', async (req, res) => {
	try {
		const { Email, Password } = req.body;
		if (!Email || !Password) {
			return res.status(400).json({ message: 'Fill all fields' });
		}
		const user = await User.findOne({ Email });
		if (user == null) {
			return res.status(404).json({ message: 'User not found' });
		}
		const matched = await bcrypt.compare(Password, user.Hash);
		if (matched) {
			const token = await createJWTtoken(user);
			return res.status(200).json({
				message: 'Success',
				token,
			});
		}
		return res.status(403).json({ message: 'Incorrect Password' });
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
		const { Name, Email, Password } = req.body;
		if (!Email || !Name || !Password) {
			return res.status(400).json({ message: 'Fill all fields' });
		}
		const existing = await User.findOne({ Email });
		if (existing !== null)
			return res.status(409).json({ message: 'User already exists' });
		const user = await User.create({
			Name,
			Email,
			Hash: bcrypt.hashSync(Password),
		});
		const token = await createJWTtoken(user);
		return res.status(200).json({
			message: 'Success',
			token,
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: 'server error. try again later' });
	}
});

module.exports = auth;
