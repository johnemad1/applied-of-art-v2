const Upload = require('../models/Uploads');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../utils/cloudinary');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Nested route
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.departmentId)
    filterObject = { department: req.params.departmentId };
  req.filterObj = filterObject;
  next();
};
const { uploadMixOfImages } = require('../middleware/uploadsMiddlewares');

exports.uploadProjectImages = uploadMixOfImages([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 9,
  },
]);

// exports.resizeProjectImages = async (req, res, next) => {
//   if (req.files.imageCover) {
//     const imageCoverFileName = `project-${uuidv4()}-${Date.now()}-cover.jpeg`;
//     await sharp(req.files.imageCover[0].buffer)
//       .resize(2000, 1333)
//       .toFormat('jpeg')
//       .jpeg({ quality: 95 })
//       .toFile(`uploads/Projects/${imageCoverFileName}`);

//     // Save image into our db
//     req.body.imageCover = imageCoverFileName;
//   }
//   // multiple images
//   if (req.files.images) {
//     req.body.images = [];
//     await Promise.all(
//       req.files.images.map(async (img, index) => {
//         const imageName = `project-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

//         await sharp(img.buffer)
//           .resize(2000, 1333)
//           .toFormat('jpeg')
//           .jpeg({ quality: 95 })
//           .toFile(`uploads/Projects/${imageName}`);

//         // Save image into our db
//         req.body.images.push(imageName);
//       }),
//     );

//     next();
//   }
// };

exports.getPendingFiles = async (req, res) => {
  try {
    const pendingFiles = await Upload.find({ status: 'pending' });
    res.status(200).json({ results: pendingFiles.length, pendingFiles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Not an action');
  }
};

exports.approveOrRejectFile = async (req, res) => {
  const uploadId = req.params.id;
  const { action } = req.body;

  try {
    const upload = await Upload.findById(uploadId);
    if (!upload) {
      throw new AppError(`No such upload ${uploadId}`);
    }
    if (action === 'approve') {
      upload.status = 'approved';
      await upload.save();
      res.status(200).json('File approved');
    } else if (action === 'reject') {
      if (upload) {
        const uploadDirectory = `applied-of-art/projects/${uploadId}`;
        await fs.remove(uploadDirectory);
        await Upload.deleteOne({ _id: uploadId });
        res.status(200).json('File rejected and deleted from server');
      } else {
        console.error('Upload object is undefined');
        return res.status(500).send('Internal Server Error');
      }
    } else {
      res.status(400).send('Invalid action');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getApprovedFiles = async (req, res) => {
  try {
    const approvedFiles = await Upload.find({
      status: 'approved',
      published: true,
    });
    res.json({ results: approvedFiles.length, approvedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

  // // Save image into our db
  // req.body.imageCover = imageCoverFileName;
};

exports.uploadFile = async (req, res, next) => {
  try {
    const upload = await Upload.create(req.body);
    res.status(201).json({ upload });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
exports.getUploads = factory.getAll(Upload);
exports.deleteProject = factory.deleteOne(Upload);

exports.resizeProjectImages = async (req, res, next) => {
  try {
    if (req.files.imageCover) {
      const imageCover = req.files.imageCover[0];
      const imageCoverName = `project-${uuidv4()}-${Date.now()}-cover.jpeg`;

      // Upload imageCover to Cloudinary
      const imageCoverResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageCover.buffer.toString('base64')}`,
        {
          folder: 'applied-of-art/projects',
          public_id: imageCoverName,
          overwrite: true, // Overwrite if file with same name already exists
        },
      );

      // Save Cloudinary URL to req.body
      req.body.imageCover = imageCoverResult.secure_url;
    }

    // Upload multiple images
    if (req.files.images) {
      req.body.images = [];

      await Promise.all(
        req.files.images.map(async (img, index) => {
          const imageName = `project-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

          // Upload image to Cloudinary
          const imageResult = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${img.buffer.toString('base64')}`,
            {
              folder: 'applied-of-art/projects',
              public_id: imageName,
              overwrite: true, // Overwrite if file with same name already exists
            },
          );

          // Save Cloudinary URL to req.body
          req.body.images.push(imageResult.secure_url);
        }),
      );
    }

    next();
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error);
    return res.status(500).send('Internal Server Error');
  }
};
