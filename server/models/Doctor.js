const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  rating: {
    type: Number,
    default: 5.0
  },
  consultations: {
    type: Number,
    default: 0
  },
  workingHours: {
    start: { type: String, default: '09:00 AM' },
    end: { type: String, default: '05:00 PM' }
  },
  languages: {
    type: [String],
    default: ['English']
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
