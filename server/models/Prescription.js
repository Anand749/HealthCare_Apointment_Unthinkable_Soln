const mongoose = require('mongoose');

const MedicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '' },
  frequency: { type: String, default: '' }, // e.g. "Morning, Afternoon, Night"
  duration: { type: String, default: '' },  // e.g. "5 Days"
  times: [String]                            // e.g. ["08:00 AM", "08:00 PM"]
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  // Raw prescription text written by doctor
  rawText: {
    type: String,
    default: ''
  },
  // Structured medicines parsed (from OCR or manual entry)
  medicines: [MedicineItemSchema],
  // AI-generated patient-friendly explanation
  patientExplanation: {
    type: String,
    default: ''
  },
  // Diagnosis summary
  diagnosis: {
    type: String,
    default: ''
  },
  // Was this generated/cleaned by AI?
  generatedByAI: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
