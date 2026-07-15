const express = require('express');
const multer = require('multer');
const {
  triageSymptoms,
  getRecommendations,
  getHealthInsights,
  scanPrescription,
  generateExplanation,
  generateSymptomSummary
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Multer config for prescription image uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for prescription scanning'), false);
    }
  }
});

// All AI routes require authentication
router.use(protect);

// Patient AI features
router.post('/triage', authorize('patient', 'doctor', 'admin'), triageSymptoms);
router.post('/recommendations', authorize('patient'), getRecommendations);
router.get('/insights', authorize('patient'), getHealthInsights);
router.post('/ocr-scan', authorize('patient'), upload.single('prescription'), scanPrescription);

// Doctor AI features
router.post('/explanation', authorize('doctor'), generateExplanation);
router.post('/symptom-summary', authorize('doctor'), generateSymptomSummary);

module.exports = router;
