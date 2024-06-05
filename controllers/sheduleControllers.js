const Schedule = require('../models/Schedule');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

//Nested Routes
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.departmentId)
    filterObject = { department: req.params.departmentId };
  req.filterObj = filterObject;
  next();
};

exports.createSchedule = factory.createOne(Schedule);
exports.getAllSchedules = factory.getAll(Schedule);
exports.getSchedule = factory.getOne(Schedule);
exports.deleteSchedule = factory.deleteOne(Schedule);
