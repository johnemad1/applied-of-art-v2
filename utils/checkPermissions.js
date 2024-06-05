const AppError = require("./appError");

const chechPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new AppError("Not authorized to access this route", 400);
};

module.exports = chechPermissions;
