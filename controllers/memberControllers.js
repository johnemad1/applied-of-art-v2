const Member = require('../models/Member');
const factory = require('./factoryHandler');
const AppError = require('../utils/appError');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.departmentId)
    filterObject = { department: req.params.departmentId };
  req.filterObj = filterObject;
  next();
};

exports.getMembers = factory.getAll(Member);
exports.getOneMember = factory.getOne(Member);
exports.deleteMember = factory.deleteOne(Member);
exports.updateMember = factory.updateOne(Member);
exports.createMember = factory.createOne(Member);

exports.getMembersByWeight = async (req, res, next) => {
  try {
    const members = await Member.find().sort({ weight: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        members,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadMemberImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image'), 400);
    }

    const imageFileName = `user-${uuidv4()}-${Date.now()}.jpeg`; // Fix uuidv4 call

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'applied-of-art/users',
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
