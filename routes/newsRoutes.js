const express = require('express');
const router = express.Router();
const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

const {
  createNews,
  deleteOneNews,
  getAllNews,
  getOneNews,
  updateNews,
  uploadNewsImage,
  upload,
} = require('../controllers/newsAndEventsControllers');

router.get('/', getAllNews);

router.use(authenticateUser);
router
  .route('/:id')
  .get(authorizePermissions('admin'), getOneNews)
  .delete(deleteOneNews)
  .put(updateNews);
router.post('/', upload.single('image'), uploadNewsImage, createNews);

module.exports = router;
