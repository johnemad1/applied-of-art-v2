const createTokenUser = (user) => {
  return { name: user.name, id: user._id, role: user.role };
};
module.exports = createTokenUser;

// const jwt = require('jsonwebtoken');

// const createToken = (payload) =>
//   jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRE_TIME,
//   });

// module.exports = createToken;
