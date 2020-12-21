const mongoose = require('mongoose');
const post = require('express').Router();
const Post = require('../models/Post.js');
const User = require('../models/User');
const Community = require('../models/Community');

post.get('/publicPosts', async (req, res) => {
	try {
		const posts = await Post.find({ public: true })
			.populate('creator')
			.lean();
		const response = posts.map((ele) => ({
			...ele,
			creator: {
				id: ele.creator._id,
				name: ele.creator.Name,
				email: ele.creator.Email,
			},
			image: ele.image.toString('base64'),
			isLiked:
				ele.voters.filter((e) => e.equals(req.jwt_payload.id))
					.length !== 0,
		}));
		return res.status(200).json({ message: 'success', data: response });
	} catch (error) {
		console.log(error.message);
		return res.status(404).json({ message: error.message });
	}
});

post.post('/createPost', async (req, res) => {
	try {
		const creator = req.jwt_payload.id;
		const { title, description, tags, public, image } = req.body;
		if (!mongoose.Types.ObjectId.isValid(creator))
			return res.status(404).send(`Enter proper Id`);
		const { communities } = req.body;
		console.log(communities);
		if (communities == null) return res.status(404).json('Fill all fields');
		// eslint-disable-next-line no-underscore-dangle
		const newPostMessage = new Post({
			title,
			description,
			creator,
			tags,
			public,
			community: communities,
			image: Buffer.from(image, 'base64'),
		});
		await newPostMessage.save();
		// eslint-disable-next-line no-underscore-dangle
		const id = (await Post.findOne(newPostMessage))._id;
		for await(const communityObjId of communities){
			await Community.findByIdAndUpdate(communityObjId, {
				$push: { posts: id },
			});
		}
		return res.status(201).json(newPostMessage);
	} catch (err) {
		console.log(err);
		return res.status(404).json('Server error. Try again later');
	}
});


post.delete('/deletePost/:id', async (req, res) => {
	const id = req.params.id;
	const creator = req.jwt_payload.id;
	console.log(id);
	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`Enter proper id`);
	const result = await Post.findOneAndRemove({ _id: id, creator: creator });
	if (result)
		return res.status(200).json({ message: 'Post deleted successfully.' });
	return res.status(400).json({ message: 'Post not found' });
});

post.get('/votePost/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.jwt_payload.id;
		let userLiked = false;
		if (
			!mongoose.Types.ObjectId.isValid(id) ||
			!mongoose.Types.ObjectId.isValid(userId)
		)
			return res.status(404).json({ message: `Enter proper Id` });
		const VotePost = await Post.findOne({ _id: id }).lean();
		if (!VotePost) return res.send(404).json({ message: 'Post not found' });
		if (VotePost) {
			const voted = await Post.findOne({ _id: id, voters: userId });
			if (!voted) userLiked = true;
			const updated = await Post.findOneAndUpdate(
				{ _id: id },
				{
					voters:
						voted != null
							? VotePost.voters.filter(
									(voter) => !voter.equals(userId)
							  )
							: [...VotePost.voters, userId],
				},
				{ new: true }
			);
			return res.status(200).json({
				message: 'success',
				voters: updated.voters,
				liked: userLiked,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'server error' });
	}
});

module.exports = post;
