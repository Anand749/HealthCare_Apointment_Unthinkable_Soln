const express = require('express');
const { holdSlot, bookAppointment, getDoctorSchedule, updateConsultation, getPatientAppointments } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/hold', authorize('patient'), holdSlot);
router.post('/book', authorize('patient'), bookAppointment);
router.get('/doctor', authorize('doctor'), getDoctorSchedule);
router.put('/:id/consult', authorize('doctor'), updateConsultation);
router.get('/patient', authorize('patient'), getPatientAppointments);

module.exports = router;
