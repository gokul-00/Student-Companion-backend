const notes = require('express').Router();
const mongoose = require('mongoose');
const Note = require('../models/Notes');
const User = require('../models/User');

notes.post('/', async (req, res) => {
	try {
		const userId = req.jwt_payload.id;
		const { title, content } = req.body;
		if (!title || !content || !userId)
			return res.status(404).json('Fill all fields');
		if (!mongoose.Types.ObjectId.isValid(userId))
			return res.status(400).json({ message: 'Improper ID' });
		if ((await User.findById(userId)) == null)
			return res.status(400).json({ message: 'User does not exist' });
		const newNotes = await Note.create({
			userId,
			title,
			content,
		});
		return res.status(200).json(newNotes);
	} catch (err) {
		console.log(err.message);
		return res.status(404).json('Server error. Try again later');
	}
});

notes.get('/list', async (req, res) => {
	try {
		const userId = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(userId))
			return res.status(400).json({ message: 'Improper ID' });
		if ((await User.findById(userId)) == null)
			return res.status(400).json({ message: 'User does not exist' });
		const allNotes = await Note.find({ userId: userId });
		return res.status(200).json(allNotes);
	} catch (err) {
		console.log(err.message);
		return res.status(404).json('Server error. Try again later');
	}
});

notes.post('/set_time', async (req, res) => {
	try {
		const { time, noteId } = req.body;
		const userId = req.jwt_payload.id;
		if (!mongoose.Types.ObjectId.isValid(userId))
			return res.status(400).json({ message: 'Improper ID' });
		if ((await User.findById(userId)) == null)
			return res.status(400).json({ message: 'User does not exist' });
		await Note.updateOne(
			{ _id: noteId },
			{ $set: { time } },
			function (err, result) {
				if (err) console.log(err);
				if (result.nModified === 1)
					return res.status(200).json({ message: 'Success' });
				if (result.n === 1)
					return res.status(400).json({ message: 'Already updated' });
				return res.status(400).json({ message: 'Cannot find notes' });
			}
		);

		return res.status(400).json({ message: 'Cannot find notes' });
	} catch (err) {
		console.log(err.message);
		return res.status(404).json('Server error. Try again later');
	}
});

notes.post('/update', async (req, res) => {});
module.exports = notes;
