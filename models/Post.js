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
	voteCount: {
		Voters: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		count: { type: Number, default: 0 },
	},
	createdAt: {
		type: Date,
		default: new Date(),
	},
});

module.exports = model('PostMessage', postSchema);
