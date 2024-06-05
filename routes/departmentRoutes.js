const express = require('express');
const router = express.Router();

const {
  createDepartment,
  getAllDepartments,
  deleteDepartment,
  getSingleDepartment,
} = require('../controllers/departmentControllers');
// protect routes

const {
  authorizePermissions,
  authenticateUser,
} = require('../middleware/authenticatin');

const userRoutes = require('./userRoutes');
const uploadRoutes = require('./uploadsRoutes');
const researchRoutes = require('./researchRoutes');
// const scheduleRoutes = require('./scheduleRoutes');
// const memberRoutes = require('./memberRoutes');

router.use('/:departmentId/research', researchRoutes);
router.use('/:departmentId/gallery', uploadRoutes);

router.use(authenticateUser);
router.use('/:departmentId/users', authorizePermissions('admin'), userRoutes);
// router.use('/:departmentId/schedules', scheduleRoutes);
// router.use('/:departmentId/members', memberRoutes);

router.use(authorizePermissions('admin'));
router.route('/').post(createDepartment).get(getAllDepartments);
router.route('/:id').delete(deleteDepartment).get(getSingleDepartment);

module.exports = router;
