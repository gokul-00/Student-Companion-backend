const {Schema, model} = require('mongoose');

const UserSchema = Schema({
  name: String,
  email: String,
  mobileNo: Number,
  verification: {
    otp: Number,
    updatedAt: Date,
  },
});

module.exports = model('User', UserSchema);
