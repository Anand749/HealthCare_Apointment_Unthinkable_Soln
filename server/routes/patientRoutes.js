const express = require('express');
const {
  getPatientProfile,
  updateHealthMetrics,
  getHealthTimeline,
  getReminders,
  createReminder,
  bulkCreateReminders,
  deleteReminder
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All patient routes require authentication and patient role
router.use(protect);
router.use(authorize('patient'));

// Profile
router.get('/profile', getPatientProfile);

// Health metrics (BP, weight, glucose)
router.put('/metrics', updateHealthMetrics);

// Health timeline
router.get('/timeline', getHealthTimeline);

// Medicine reminders
router.route('/reminders')
  .get(getReminders)
  .post(createReminder);

router.post('/reminders/bulk', bulkCreateReminders);
router.delete('/reminders/:id', deleteReminder);

module.exports = router;
