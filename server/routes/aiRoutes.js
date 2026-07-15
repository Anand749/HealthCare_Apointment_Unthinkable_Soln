const express = require('express');
const multer = require('multer');
const path = require('path');
const { triageSymptoms, getRecommendations, getHealthInsights, scanPrescription, generateExplanation } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Multer Config
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.post('/triage', triageSymptoms);
router.post('/recommendations', getRecommendations);
router.get('/insights', getHealthInsights);
router.post('/ocr-scan', upload.single('prescription'), scanPrescription);
router.post('/explanation', generateExplanation);

module.exports = router;
