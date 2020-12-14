const community = require('express').Router();
const Id = require('generate-unique-id');
const mongoose = require('mongoose');

const User = require('../models/User');

const Community = require('../models/Community');

community.post('/start', async (req, res) => {
	const name = req.body.name;
	const admin = req.jwt_payload.id;
	if (mongoose.Types.ObjectId.isValid(admin))
		return res.status(400).json({ message: 'Improper ID' });
	if ((await User.findById(admin)) == null)
		return res.status(400).json({ message: 'User does not exist' });
	const communityId = Id({ length: 5 });
	const newCommunity = new Community({
		name,
		admin,
		communityId,
	});
	newCommunity.save();
	return res.status(200).json(newCommunity);
});
community.post('/join', async (req, res) => {
	const id = req.jwt_payload.id;
	const { communityId } = req.body;
	const result = await User.findOneAndUpdate(
		{ communityId: communityId },
		{ $addToSet: { members: id } }
	);
	if (result.n === 1) return res.status(200).json({ message: 'Success' });
	return res.status(400).json({ message: 'Invalid community Id' });
});
