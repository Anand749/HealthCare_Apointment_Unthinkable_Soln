const express = require('express');
const { createLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize('admin', 'doctor'), createLeave);

module.exports = router;
