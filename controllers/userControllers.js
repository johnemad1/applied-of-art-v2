const AppError = require('../utils/appError');
const User = require('../models/User');
const Department = require('../models/Department');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const xlsx = require('xlsx');
const fs = require('fs');
const factory = require('./factoryHandler');
const path = require('path');
const { Result } = require('express-validator');

// ----------------------------------------------------------------

exports.setDepartmentIdToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.department) req.body.department = req.params.departmentyId;
  next();
};

// Nested route
// GET /api/v1/deparments/:departmentId/subdeparments
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.departmentId)
    filterObject = { department: req.params.departmentId };
  req.filterObj = filterObject;
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Upload single image
exports.uploadUserPhoto = upload.single('photo');

// resize image
// exports.resizeUserPhoto = async (req, res, next) => {
//   if (!req.file) return next();

//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

//   // set the directory
//   const outputDirectory = 'uploads/users'; // Set the output directory
//   const outputPath = `${outputDirectory}/${req.file.filename}`;

//   // Create the output directory if it doesn't exist
//   if (!fs.existsSync(outputDirectory)) {
//     fs.mkdirSync(outputDirectory, { recursive: true });
//   }

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(outputPath);

//   next();
// };

// ----------------------------------------------------------------
// factory.getAll(User.look, "Users");
exports.getAllUsers = factory.getAll(User, 'Users');

exports.getAllDoctors = async (req, res) => {
  const { academicId, department } = req.query;
  let query = {
    role: 'doctor',
    academicId,
  };

  // If department is provided, add it to the query
  if (department) {
    query.department = department;
  }
  const doctors = await User.find(query).select('-password');
  res.status(200).json({ result: doctors.length, doctors });
};

exports.updateMe = async (req, res, next) => {
  try {
    // Filter the body to include only allowed fields
    const filteredBody = filterObj(req.body, 'name', 'email');

    // Check if a file is uploaded
    if (req.file) {
      // Upload photo to Cloudinary
      const imageResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'applied-of-art/users',
          overwrite: true,
        },
      );

      filteredBody.photo = imageResult.secure_url;
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    // Respond with updated user information
    res.status(200).json({
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return next(new AppError('Error updating user', 500));
  }
};

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getUser = factory.getOne(User);

exports.delteDepartmentUser = factory.deleteAll(User);
//-----------------------------------------------------------
exports.uploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Parse uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Keep track of the number of users stored
    let numUsersStored = 0;

    // Iterate over each user data
    await Promise.all(
      data.map(async (userData) => {
        // Validate email and academicID
        if (!userData.email || !userData.academicID) {
          throw new AppError(`Email or academic ID is missing for user`, 400);
        }

        // Trim strings in user data
        const trimmedUserData = {};
        Object.keys(userData).forEach((key) => {
          trimmedUserData[key] =
            (typeof userData[key] === 'string' && userData[key].trim()) ||
            userData[key];
        });

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: trimmedUserData.email },
            { academicID: trimmedUserData.academicID },
          ],
        });
        if (existingUser) {
          throw new AppError(
            `User with email ${trimmedUserData.email} or academic ID ${trimmedUserData.academicID} already exists. Skipping...`,
          );
        }

        // Validate role
        const validRoles = ['admin', 'student', 'doctor'].map((role) =>
          role.toLowerCase(),
        );
        if (!validRoles.includes(trimmedUserData.role)) {
          throw new AppError(
            `${trimmedUserData.role} is not a valid role for user`,
            400,
          );
        }

        // Find department
        let department;
        if (trimmedUserData.department) {
          const trimmedDepartmentId = trimmedUserData.department.trim();
          department = await Department.findById(trimmedDepartmentId);
          if (!department) {
            throw new AppError(
              `Department with ID ${trimmedDepartmentId} not found`,
              400,
            );
          }
        } else {
          throw new AppError(`Department ID is missing for user`, 400);
        }

        // Create user
        const newUser = new User({
          name: trimmedUserData.name,
          email: trimmedUserData.email,
          password: trimmedUserData.password,
          academicID: trimmedUserData.academicID,
          role: trimmedUserData.role,
          department: department._id,
        });
        await newUser.save();
        numUsersStored++; // Increment the counter
      }),
    );

    res
      .status(200)
      .json({ msg: 'Users uploaded successfully', numUsersStored });
  } catch (error) {
    // Handle errors
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
