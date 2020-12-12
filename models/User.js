const { Schema, model } = require('mongoose');

const UserSchema = Schema({
	name: String,
	uname: String,
	mobileNo: Number,
	registered: {
		type: Boolean,
		Default: false,
	},
	verification: {
		otp: Number,
		updatedAt: Date,
	},
});

module.exports = model('User', UserSchema);

/*
User model requirements : 
  name
  email
  password
  memberAt : [{
    communityid
    isAdmin
  }]
  post : [ postID ]
*/
