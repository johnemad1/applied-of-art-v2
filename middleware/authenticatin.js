const AppError = require('../utils/appError');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');

const { attachCookiesToResponse } = require('../utils');

////-------------------------------------------------------------------------

const authenticateUser = async (req, res, next) => {
  let accessToken, refreshToken;

  // Extract the access token from the Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.split(' ')[1];
  }

  // Extract the refresh token from the signed cookies
  refreshToken = req.signedCookies.refreshToken;

  try {
    if (!accessToken && !refreshToken) {
      return next(new AppError('Authentication Token Missing', 401));
    }

    // Validate the access token if present
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }

    // Validate the refresh token if access token is missing
    const payload = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken.isValid) {
      return next(new AppError('Authentication Invalid', 401));
    }

    // Attach new access and refresh tokens to the response
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    return next(new AppError('Authentication Invalid', 401));
  }
};

//--------------------------------------------------------------------------
// const authenticateUser = async (req, res, next) => {
//   const { refreshToken, accessToken } = req.signedCookies;

//   try {
//     if (accessToken) {
//       const payload = isTokenValid(accessToken);
//       req.user = payload.user;
//       return next();
//     }
//     const payload = isTokenValid(refreshToken);

//     const existingToken = await Token.findOne({
//       user: payload.user.userId,
//       refreshToken: payload.refreshToken,
//     });

//     if (!existingToken || !existingToken?.isValid) {
//       throw new AppError('Authentication Invalid');
//     }

//     attachCookiesToResponse({
//       res,
//       user: payload.user,
//       refreshToken: existingToken.refreshToken,
//     });

//     req.user = payload.user;
//     next();
//   } catch (error) {
//     throw new AppError('Authentication Invalid');
//   }
// };

// //-------------------------------------------------------------------------
// const authorizePermissions = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(new AppError('Unauthorized to access this route'));
//     }
//     next();
//   };
// };

// module.exports = {
//   authenticateUser,
//   authorizePermissions,
// };
