const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Please add appointment date']
  },
  slot: {
    type: String,
    required: [true, 'Please add appointment time slot']
  },
  symptoms: {
    type: String,
    required: [true, 'Please add symptom notes']
  },
  reports: [
    {
      name: String,
      url: String
    }
  ],
  diagnosis: String,
  prescription: String,
  visitNotes: String,
  aiSymptomSummary: String,
  aiPatientExplanation: String,
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to guarantee atomic double booking prevention at MongoDB layer (Requirement 1)
AppointmentSchema.index({ doctor: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
