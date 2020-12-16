const community = require('express').Router();
const Id = require('generate-unique-id');
const mongoose = require('mongoose');

const User = require('../models/User');

const Community = require('../models/Community');

community.post('/start', async (req, res) => {
	try {
		const name = req.body.name;
		const admin = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(admin))
			return res.status(400).json({ message: 'Improper ID' });
		if ((await User.findById(admin)) == null)
			return res.status(400).json({ message: 'User does not exist' });
		const communityId = Id({ length: 5 });
		if ((await Community.findOne({ name })) != null)
			return res.status(400).json({ message: 'Community already exist' });
		const newCommunity = await Community.create({
			name,
			admin,
			communityId,
		});
		return res.status(200).json(newCommunity);
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});
community.post('/join', async (req, res) => {
	try {
		const id = req.jwt_payload.id;
		const { communityId } = req.body;
		try {
			await Community.updateOne(
				{ communityId },
				{
					$addToSet: { members: [id] },
				},
				(err, result) => {
					console.log(result.nModified);
					if (err) console.log(err.message);
					if (result.nModified === 1)
						return res.status(200).json({ message: 'Success' });
					if (result.n === 1)
						return res
							.status(400)
							.json({ message: 'Already a member' });
					return res
						.status(400)
						.json({ message: 'Community not found' });
				}
			);
		} catch (err) {
			return res.status(400).json({ message: 'Record does not exist' });
		}
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});
community.post('/leave', async (req, res) => {
	const id = req.jwt_payload.id;
	const { communityId } = req.body;
	console.log(communityId);
	try {
		await Community.updateOne(
			{ communityId },
			{
				$pull: { members: id },
			},
			(err, result) => {
				if (err) console.log(err.message);
				else if (result.nModified === 1)
					return res.status(200).json({ message: 'Success' });
				return res.status(400).json({ message: 'Community not found' });
			}
		);
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});
community.get('/detail', async (req, res) => {
	try {
		const creator = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(creator))
			return res.status(400).json({ message: 'Improper ID' });
		const communityDetails = await Community.find({ admin: creator });
		communityDetails.push(await Community.find({ members: creator }));
		return res.status(202).json(communityDetails);
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});
community.post('/edit', async (req, res) => {
	try {
		const creator = req.jwt_payload.id;
		const { removeId } = req.body;
		if (
			!mongoose.Types.ObjectId.isValid(creator) &&
			!mongoose.Types.ObjectId.isValid(removeId)
		) {
			return res.status(400).json({ message: 'Improper ID' });
		}
		if (
			(await Community.findOne({ admin: creator, members: removeId })) ==
			null
		)
			return res
				.status(400)
				.json({ message: 'Common community not found' });
		await Community.updateOne(
			{ admin: creator, members: removeId },
			{ $pull: { members: removeId } }
		);
		return res.status(200).json({ message: 'Success' });
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});
module.exports = community;
