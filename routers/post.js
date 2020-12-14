const mongoose = require('mongoose');
const post = require('express').Router();
const Post = require('../models/Post.js');
const User = require('../models/User');
const Community = require('../models/Community');

post.get('/publicPosts', async (req, res) => {
	try {
		const posts = await Post.find({ public: true });
		console.log(posts);
		return res.status(200).json(posts);
	} catch (error) {
		console.log(error.message);
		return res.status(404).json({ message: error.message });
	}
});
post.get('/communityPosts', async (req, res) => {
	try {
		const userid = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(userid))
			return res.status(400).json({ message: 'Improper id' });
		const community = await Community.find({
			$or: [{ members: userid }, { creator: userid }],
		});
		console.log(community);
		let posts = [];
		for (let i = 0; i < community.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			const result = await Post.find({
				public: false,
				// eslint-disable-next-line no-underscore-dangle
				community: community[i]._id,
			});
			posts.push({
				post: result,
				// eslint-disable-next-line no-underscore-dangle
				community: community[i]._id,
			});
		}
		console.log(posts);
		return res.status(200).json(posts);
	} catch (error) {
		console.log(error.message);
		return res.status(404).json({ message: error.message });
	}
});

/* post.get('/searchPost', async (req, res) => {
	const { id } = req.params;

	try {
		const post = await Post.findById(id);
		res.status(200).json(post);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
}); */

post.post('/createPost', async (req, res) => {
	try {
		let creator = req.jwt_payload.id;
		const { title, message, tags, public, anonymous } = req.body;
		if (anonymous) creator = '507f1f77bcf86cd799439011'; // for anonymous create a random entry with
		if (!title || !message || !creator)
			return res.status(404).json('Fill all fields');
		if (!mongoose.Types.ObjectId.isValid(creator))
			return res.status(404).send(`Enter proper Id`);
		if (!public) {
			const { communityId } = req.body;
			if (communityId == null)
				return res.status(404).json('Fill all fields');
			// eslint-disable-next-line no-underscore-dangle
			const communityObjId = (await Community.findOne({ communityId }))
				._id;
			const newPostMessage = new Post({
				title,
				message,
				creator,
				tags,
				public,
				community: communityObjId,
			});
			await newPostMessage.save();
			// eslint-disable-next-line no-underscore-dangle
			const id = (await Post.findOne(newPostMessage))._id;
			await Community.findByIdAndUpdate(communityObjId, {
				$push: { posts: id },
			});
			return res.status(201).json(newPostMessage);
		}
		const newPostMessage = new Post({
			title,
			message,
			creator,
			tags,
			public,
		});
		await newPostMessage.save();
		return res.status(201).json(newPostMessage);
	} catch (err) {
		console.log(err);
		return res.status(404).json('Server error. Try again later');
	}
});

post.get('/updatePost/:id', async (req, res) => {
	const { id } = req.params;
	const creator = req.jwt_payload.id;
	const { title, message, tags } = req.body;
	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`Enter proper Id`);
	try {
		const updatedPost = { creator, title, message, tags, _id: id };
		const result = await Post.findOneAndUpdate(
			{ _id: id, creator: creator },
			updatedPost,
			{ new: true }
		);
		if (result.nModified === 1) return res.status(201).json(updatedPost);
		return res.status(400).json({ message: 'Record does not exist' });
	} catch (err) {
		console.log(err.message);
		return res.status(400).json(`No post with id: ${id}`);
	}
});

post.get('/deletePost/:id', async (req, res) => {
	const { id } = req.params.id;
	const creator = req.jwt_payload.id;
	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(404).send(`Enter proper id`);
	const result = await Post.findOneAndRemove({ _id: id, creator: creator });
	console.log(result);
	if (result.n === 1)
		return res.status(200).json({ message: 'Post deleted successfully.' });
	return res.status(400).json({ message: 'Post not found' });
});

post.get('/votePost/:id', async (req, res) => {
	const { id } = req.params;
	const userId = req.jwt_payload.id;
	if (
		!mongoose.Types.ObjectId.isValid(id) ||
		!mongoose.Types.ObjectId.isValid(userId)
	)
		return res.status(404).json({ message: `Enter proper Id` });
	const posts = await Post.findById(id);
	if ((await Post.findOne({ _id: id, creator: userId })) != null) {
		await Post.findByIdAndUpdate(
			id,
			{ voteCount: posts.voteCount - 1, $pull: { voters: userId } },
			{ new: true }
		);
	}
	await Post.findByIdAndUpdate(
		id,
		{ voteCount: posts.voteCount + 1, $push: { voters: userId } },
		{ new: true }
	);
	return res.status(200).json({ message: 'Success' });
});

module.exports = post;
