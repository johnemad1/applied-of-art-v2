const jwt = require('jsonwebtoken');
const { secure } = require('./nodemailerConfig');

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  // Set access token cookie
  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    //secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: false, // Set to true if served over HTTPS
    //secure: process.env.NODE_ENV === "production",
    sameSite: 'none',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });

  // Send the response with cookies attached
  res.status(200).json({
    status: 'success',
    accessTokenJWT,
    data: {
      user,
    },
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
