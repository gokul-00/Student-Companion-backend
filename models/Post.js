const { Schema, model } = require('mongoose');

const postSchema = Schema({
	title: String,
	message: String,
	tags: [String],
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	community: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Community',
		},
	],
	public: Boolean,
	voteCount: Number,
	voters: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	createdAt: {
		type: Date,
		default: new Date(),
	},
});

module.exports = model('Post', postSchema);
