const User = require('../models/User');
const Token = require('../models/Token');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const crypto = require('crypto');

const {
  attachCookiesToResponse,
  createTokenUser,

  sendResetPasswordEmail,
  createHash,
} = require('../utils');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password');
  }
  const user = await User.findOne({ email }).select('-email');

  if (!user) {
    throw new AppError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid Credentials', 400);
  }
  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new AppError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(200).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(200).json({ user: tokenUser });
};

exports.logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(201).json({ msg: 'user logged out!' });
};
exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    const origin = process.env.ORIGIN;
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(200)
    .json({ msg: 'Please check your email for reset password link' });
};

exports.resetPassword = async (req, res, next) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    return next(new AppError('Please provide all values'));
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send('reset password');
};
