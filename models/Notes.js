const { Schema, model } = require('mongoose');

const noteSchema = Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	title: String,
	content: String,
	time: Date,
});
module.exports = model('Notes', noteSchema);
