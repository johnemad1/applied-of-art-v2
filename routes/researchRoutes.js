const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');
const {
  upload,
  createResearch,
  storeResearchToDB,
  getResearch,
  getOneResearch,
  deleteResearch,
} = require('../controllers/researchControllers');

router.get('/', getResearch);
router.use(authenticateUser);
router.post(
  '/',
  authorizePermissions('doctor', 'admin'),
  upload.array('pdf'),
  storeResearchToDB,
);

authorizePermissions('doctor');
router.route('/:id').get(getOneResearch).delete(deleteResearch);
module.exports = router;
