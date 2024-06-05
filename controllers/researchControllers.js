const AppError = require('../utils/appError');
const Research = require('../models/Research');
const Department = require('../models/Department');
const factory = require('./factoryHandler');

const multer = require('multer');

// Nested route
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.departmentId)
    filterObject = { department: req.params.departmentId };
  req.filterObj = filterObject;
  next();
};

const outputDirectory = 'uploads/research';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, outputDirectory);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Not an PDF'), false);
  }
};
exports.upload = multer({ storage: storage, fileFilter: multerFilter });

exports.storeResearchToDB = async (req, res) => {
  const { name, description, departmentId, userId } = req.body;
  const pdfs = req.files.map((file) => file.path);
  const research = await Research.create({
    name,
    departmentId,
    userId,
    description,
    pdfs,
  });
  res.status(200).json(research);
};
//exports.createRsearch = factory.createOne(Research);
exports.getResearch = factory.getAll(Research);
exports.deleteResearch = factory.deleteOne(Research);
exports.getOneResearch = factory.getOne(Research);
