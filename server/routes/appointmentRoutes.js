const express = require('express');
const {
  holdSlot,
  bookAppointment,
  getDoctorSchedule,
  updateConsultation,
  getPatientAppointments,
  updateAppointmentStatus,
  getAllAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// Patient routes
router.post('/hold', authorize('patient'), holdSlot);
router.post('/book', authorize('patient'), bookAppointment);
router.get('/patient', authorize('patient'), getPatientAppointments);

// Doctor routes
router.get('/doctor', authorize('doctor'), getDoctorSchedule);
router.put('/:id/consult', authorize('doctor'), updateConsultation);
router.patch('/:id/status', authorize('doctor'), updateAppointmentStatus);

// Admin routes
router.get('/all', authorize('admin'), getAllAppointments);

module.exports = router;
