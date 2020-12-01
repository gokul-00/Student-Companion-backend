const mongoose = require('mongoose');
const otpGenerator = require('otp-generator');


const User = require('../models/User.js');
const {checkOtpValid, sendOtp} = require('../helpers/otp');
const {createJWTtoken} = require('../helpers/jwt')
const auth = require('../router/auth.js');

 const otpinit = async (req, res) => {
  try {
    const {mobileNo} = req.body;
    if (!mobileNo)
      return res.status(400).json({message: 'Enter mobile number'});
    const otp = otpGenerator.generate(6, {
    	upperCase: false,
    	specialChars: false,
    	alphabets: false,
    });
    if (otp[0] == 0) otp[0] = Math.floor(Math.random() * 9) + 1;

    let existingUser = await User.findOne({mobileNo: req.body.mobileNo});
    
    if (existingUser == null) {
      existingUser = await User.create({
        mobileNo,
        verification: {
          otp,
          updatedAt: new Date(),
        },
      });
      return res
        .status(200)
        .json({message: 'OTP Sent', exist: existingUser.register});
    }
    if (checkOtpValid(existingUser)) {
      return res
        .status(208)
        .json({message: 'wait for 59 seconds to Resend OTP'});
    }
    const update = {
      otp,
      updatedAt: new Date(),
    };
    await User.findOneAndUpdate(
      {mobileNo},
      {verification: update},
      {useFindAndModify: false}
    );
    await sendOtp(mobileNo, otp);
    return res
      .status(200)
      .json({message: 'OTP Sent', exist: existingUser.register});
  } catch (e) {
    console.log(e);
    return res.status(500).json({message: 'Try again later'});
  }
}


 const login = async (req, res)=> {
  try {
    const {mobileNo, otp, registrationToken} = req.body;
    if (!mobileNo || !otp ) {
      return res.status(400).json({message: 'Fill all fields'});
    }
    const user = await User.findOne({mobileNo})
    if (user == null) {
      return res.status(404).json({message: 'User not found'});
    }
    if (!user.email) {
      register(req,res)
    }
    if (otp === user.verification.otp && checkOtpValid(user)) {
      await User.findOneAndUpdate(
        {mobileNo},
        {lastLogin: new Date(), registrationToken},
        {useFindAndModify: false}
      );
      const token = await createJWTtoken(user);
      return res.status(200).json({
        message: 'Success',
        token,
      });
    }
    if (otp !== user.verification.otp && helperTime.checkOtpValid(user)) {
      return res.status(400).json({message: 'Invalid OTP'});
    }
    return res.status(403).json({message: 'OTP expired'});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: 'server error. try again later'});
  }
}

const register = async (req,res) =>{
    try {
      const {
        mobileNo,
        name,
        email,
        otp
      } = req.body;
      if (
        !mobileNo ||
        !name ||
        !email
      ) {
        return res.status(400).json({message: 'Fill all fields'});
      }
      const user = await User.findOne({mobileNo});
            console.log(user.verification.otp, otp);
      if (user.name)
        return res.status(409).json({message: 'User already exists'});
      if (user == null) {
        return res.status(404).json({message: 'User not found.'});
      }


      if (otp === user.verification.otp && checkOtpValid(user)) {
       

        user.name = name;
        user.mobileNo = mobileNo;
        user.email = email;
        await user.save();

        const token = await createJWTtoken(user);
        const savedUser = await User.findOne({mobileNo})
        return res.status(200).json({
          message: 'Success',
          token})
      }
      if (otp !== user.verification.otp && checkOtpValid(user)) {
        return res.status(400).json({message: 'Invalid OTP'});
      }
      return res.status(403).json({message: 'OTP expired'});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: 'server error. try again later'});
    }
}

module.exports = {login, otpinit, register}