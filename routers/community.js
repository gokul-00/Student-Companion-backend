const community = require('express').Router();
const mongoose = require('mongoose');

const User = require('../models/User');

const Community = require('../models/Community');
const Post = require('../models/Post');

community.get('/:id', async (req, res) => {
	try {
		const communityId = req.params.id;
		const userId = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(communityId))
			return res.status(400).json({ message: 'Improper ID' });
		const communityDetails = await Community.findById(communityId).populate('members', 'Name Email').lean().exec();
		const posts = await Post.find({ community: communityId })
			.populate('creator', 'Name Email')
			.lean()
			.exec();
		const updatedPosts = posts.map((item) => ({
			...item,
			image: item.image.toString('base64'),
			isLiked:
				item.voters.filter((e) => e.equals(req.jwt_payload.id))
					.length !== 0,
		}));
		const response = {
			...communityDetails,
			posts: updatedPosts,
		};
		return res.status(200).json({ message: 'success', data: response });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: 'server error' });
	}
});

community.post('/create', async (req, res) => {
	try {
		const name = req.body.name;
		const admin = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(admin))
			return res.status(400).json({ message: 'Improper ID' });
		if ((await User.findById(admin)) == null)
			return res.status(400).json({ message: 'User does not exist' });
		if ((await Community.findOne({ name })) != null)
			return res.status(400).json({ message: 'Community already exist' });
		const newCommunity = await Community.create({
			name,
			admin,
			members: [admin],
		});
		return res.status(200).json(newCommunity.id);
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
				{ _id: communityId },
				{
					$addToSet: { members: [id] },
				},
				(err, result) => {
					if (err) console.log(err.message);
					if (result.nModified === 1)
						return res.status(200).json({ 
							message: 'Success',
							data: {
								communityId: result.id,
							},
						});
					if (result.n === 1)
						return res
							.status(400)
							.json({ message: 'Already a member' });
					return res
						.status(400)
						.json({ message: 'Community not found' });
				}
			);
			return res.status(400).json({ message: 'Community not found' });
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
		return res.status(400).json({ message: 'Community not found' });
	} catch (err) {
		console.log(err.message);
		return res
			.status(404)
			.json({ message: 'server error, try again later' });
	}
});

module.exports = community;
