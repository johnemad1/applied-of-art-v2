// routes/fileRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  uploadFile,
  uploadProjectImages,
  resizeProjectImages,
  getApprovedFiles,
  getPendingFiles,
  approveOrRejectFile,
  createFilterObj,
  getUploads,

  deleteProject,
} = require('../controllers/uploadsControllers');

const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

router.get('/gallery', createFilterObj, getApprovedFiles);

router.use(authenticateUser);

router.post(
  '/project',
  authorizePermissions('student'),
  uploadProjectImages,
  resizeProjectImages,
  uploadFile,
);
router.get(
  '/pending-files',
  authorizePermissions('admin', 'doctor'),
  getPendingFiles,
);
router.put(
  '/pending-files/:id',
  authorizePermissions('admin', 'doctor'),
  approveOrRejectFile,
);

router.get('/', authorizePermissions('admin', 'doctor'), getUploads);
router.delete('/:id', authorizePermissions('admin', 'doctor'), deleteProject);
module.exports = router;
