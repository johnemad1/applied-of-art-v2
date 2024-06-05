const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  getMembersByWeight,
  getMembers,
  updateMember,
  deleteMember,
  getOneMember,
  createMember,
  upload,
  createFilterObj,
  uploadMemberImage,
} = require('../controllers/memberControllers');
const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

// protect Routes

router.get('/', getMembersByWeight);
router.get('/all-members', createFilterObj, getMembers);

router.use(authenticateUser);
router.use(authorizePermissions('admin'));
router.post('/', upload.single('image'), uploadMemberImage, createMember);
router.route('/:id').delete(deleteMember).patch(updateMember).get(getOneMember);
module.exports = router;
