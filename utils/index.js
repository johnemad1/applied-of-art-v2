const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const createHash = require("./createHash");
const createTokenUser = require("./createTokenUser");
const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");

module.exports = {
  sendResetPasswordEmail,
  createHash,
  createJWT,
  isTokenValid,
  createTokenUser,
  attachCookiesToResponse,
};
