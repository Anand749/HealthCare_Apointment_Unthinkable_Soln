const mongoose = require('mongoose');

const MedicineReminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  prescription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Prescription',
    default: null
  },
  medicine: {
    type: String,
    required: [true, 'Medicine name is required']
  },
  dosage: {
    type: String,
    default: ''
  },
  // Human-readable frequency: "Morning, Afternoon, Night"
  frequency: {
    type: String,
    default: ''
  },
  // Array of time strings: ["08:00 AM", "02:00 PM", "08:00 PM"]
  times: {
    type: [String],
    default: []
  },
  // Duration in days or as text: "5 Days", "2 Weeks"
  duration: {
    type: String,
    default: ''
  },
  // Start date for the reminder schedule
  startDate: {
    type: Date,
    default: Date.now
  },
  // End date (calculated from duration)
  endDate: {
    type: Date,
    default: null
  },
  // Whether reminder is still active
  active: {
    type: Boolean,
    default: true
  },
  // Source: 'manual' (user added) or 'ocr' (scanned prescription)
  source: {
    type: String,
    enum: ['manual', 'ocr', 'ai'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicineReminder', MedicineReminderSchema);
