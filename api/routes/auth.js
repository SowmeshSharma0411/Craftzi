//to register and login : for more security:
const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js'); //to hash the password : to store in the db
const jwt = require('jsonwebtoken');

//jwt for admin or non admin auth

//Register :
router.post('/register', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.send(500).json(err);

    //handling of this error can be done a lil better : this block of code can be edited later on
  }
});

//LOGIN:
router.post('/login', async (req, res) => {
  // console.log('hh');
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json('Wrong Credentials!');

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    OriginalPassword !== req.body.password &&
      res.status(401).json('Wrong Credentials!');

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
