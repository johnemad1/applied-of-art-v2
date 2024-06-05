const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateUser } = require('../middleware/authenticatin');
const {
  createSchedule,
  getAllSchedules,
  getSchedule,
  deleteSchedule,
  createFilterObj,
} = require('../controllers/sheduleControllers');

router.get('/', createFilterObj, getAllSchedules);

router.use(authenticateUser);

router.route('/').post(createSchedule);
router.route('/:id').get(getSchedule).delete(deleteSchedule);
module.exports = router;
