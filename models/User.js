const { Schema, model } = require('mongoose');

const UserSchema = Schema({
	Name: String,
	Email: String,
	Password: String,
	// Hash: String,
	// registered: {
	// 	type: Boolean,
	// 	Default: false,
	// },
	// verification: {
	// 	otp: Number,
	// 	updatedAt: Date,
	// },
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
