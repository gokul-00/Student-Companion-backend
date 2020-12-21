const { Schema, model } = require('mongoose');

const postSchema = Schema({
	title: String,
	description: String,
	tags: [String],
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	image: Buffer,
	community: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Community',
		},
	],
	public: Boolean,
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
