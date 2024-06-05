const express = require('express');
const router = express.Router();

const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

const {
  createEvents,
  deleteOneEvents,
  getAllEvents,
  getOneEvents,
  updateEvents,
  uploadEventsImage,
  upload,
} = require('../controllers/newsAndEventsControllers');

router.route('/').get(getAllEvents);

router.use(authenticateUser);
router.use(authorizePermissions('admin'));
router
  .route('/:id')
  .get(getOneEvents)
  .delete(deleteOneEvents)
  .put(updateEvents);
router.post('/', upload.single('image'), uploadEventsImage, createEvents);
module.exports = router;
