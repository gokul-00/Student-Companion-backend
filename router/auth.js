const auth = require('express').Router();
const {login,otpinit,register} = require('../controller/auth');

auth.post('/otpinit',otpinit)
auth.post('/login',login)
auth.post('/register',register)
module.exports = auth;