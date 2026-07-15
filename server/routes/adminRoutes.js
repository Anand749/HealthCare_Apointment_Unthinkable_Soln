const express = require('express');
const {
  addDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  getAllPatients,
  getAnalytics,
  getNotificationLogs
} = require('../controllers/adminController');
const { getAllAppointments } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Doctor management
router.route('/doctors')
  .get(getAllDoctors)
  .post(addDoctor);

router.route('/doctors/:id')
  .put(updateDoctor)
  .delete(deleteDoctor);

// Patient management
router.get('/patients', getAllPatients);

// Appointments view
router.get('/appointments', getAllAppointments);

// Dashboard analytics
router.get('/analytics', getAnalytics);

// Notification / email logs
router.get('/notifications', getNotificationLogs);

module.exports = router;
