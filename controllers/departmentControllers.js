const Department = require('../models/Department');
const Schedule = require('../models/Department');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

exports.createDepartment = factory.createOne(Department);
exports.getAllDepartments = factory.getAll(Department, 'Department');
exports.getSingleDepartment = factory.getOne(Department);
exports.deleteDepartment = factory.deleteOne(Department);
exports.updateDepartment = factory.updateOne(Department);
