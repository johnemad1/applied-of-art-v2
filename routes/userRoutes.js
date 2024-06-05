const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

const {
  getAllUsers,
  getUser,
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe,
  deleteUser,
  updateUser,
  getAllDoctors,
  delteDepartmentUser,
  uploadUsers,
  createFilterObj,
} = require('../controllers/userControllers');

router.use(authenticateUser);

router.patch('/updateMe', uploadUserPhoto, updateMe);
router.get('/doctors', getAllDoctors);
router.get('/doctors', getAllDoctors);

router.use(authorizePermissions('admin'));
router.delete('/', createFilterObj, delteDepartmentUser);
router.post('/upload-user', upload.single('file'), uploadUsers);
router.route('/').get(createFilterObj, getAllUsers);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
