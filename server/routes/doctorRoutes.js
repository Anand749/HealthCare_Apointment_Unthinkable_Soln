const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorAvailability,
  getDoctorSlots
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All doctor routes require authentication
router.use(protect);

// Doctor's own profile management (before /:id to avoid conflict)
router.get('/profile/me', authorize('doctor'), getDoctorProfile);
router.put('/profile/availability', authorize('doctor'), updateDoctorAvailability);

// Get all doctors (patients, doctors, admins can view)
router.get('/', getAllDoctors);

// Get doctor slot availability for a specific date
router.get('/:id/slots', getDoctorSlots);

// Get single doctor profile
router.get('/:id', getDoctorById);

module.exports = router;
