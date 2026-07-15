const express = require('express');
const { getAllDoctors } = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('patient'), getAllDoctors);

module.exports = router;
