const { Schema, model } = require('mongoose');

const CommunitySchema = new Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
	},
	admin: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	members: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	posts: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Post',
		},
	],
});
module.exports = model('Community', CommunitySchema);
