const { Schema, model } = require('mongoose');

const UserSchema = Schema({
	Name: String,
	Email: String,
	Hash: String,
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
