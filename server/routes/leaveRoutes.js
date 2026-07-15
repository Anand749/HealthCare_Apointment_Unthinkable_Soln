const express = require('express');
const { createLeave, getDoctorLeaves, deleteLeave, getAllLeaves } = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// Get all leaves (admin)
router.get('/', authorize('admin'), getAllLeaves);

// Create leave (doctor or admin)
router.post('/', authorize('admin', 'doctor'), createLeave);

// Get leaves for a specific doctor
router.get('/:doctorId', authorize('admin', 'doctor'), getDoctorLeaves);

// Cancel a leave
router.delete('/:id', authorize('admin', 'doctor'), deleteLeave);

module.exports = router;
