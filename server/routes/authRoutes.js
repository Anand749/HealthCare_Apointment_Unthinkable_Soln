const express = require('express');
const { registerPatient, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
