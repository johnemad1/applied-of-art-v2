const factory = require('./factoryHandler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const AppError = require('../utils/appError');
const News = require('../models/News');
const Events = require('../models/Events');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an Image'), false);
  }
};
exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventsImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image'), 400);
    }

    const imageFileName = `event-${uuidv4()}-${Date.now()}.jpeg`; // Fix uuidv4 call

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'applied-of-art/events',
        public_id: imageFileName,
        overwrite: true,
      },
    );

    // Save Cloudinary URL to req.body
    req.body.image = imageResult.secure_url;

    next();
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return next(new AppError('Error uploading image to Cloudinary', 500));
  }
};

exports.uploadNewsImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image'), 400);
    }

    const imageFileName = `news-${uuidv4()}-${Date.now()}.jpeg`;

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'applied-of-art/news',
        public_id: imageFileName,
        overwrite: true,
      },
    );

    // Save Cloudinary URL to req.body
    req.body.image = imageResult.secure_url;

    next();
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return next(new AppError('Error uploading image to Cloudinary', 500));
  }
};
//------------------------------News Controllers------------------------------------

exports.createNews = factory.createOne(News);
exports.deleteOneNews = factory.deleteOne(News);
exports.getOneNews = factory.getOne(News);
exports.getAllNews = factory.getAll(News);
exports.updateNews = factory.updateOne(News);
//-------------------------Events Controllers-----------------------------------------

exports.createEvents = factory.createOne(Events);
exports.deleteOneEvents = factory.deleteOne(Events);
exports.getOneEvents = factory.getOne(Events);
exports.getAllEvents = factory.getAll(Events);
exports.updateEvents = factory.updateOne(Events);
