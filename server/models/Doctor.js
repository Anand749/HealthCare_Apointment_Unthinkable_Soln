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
  department: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  consultations: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  hospital: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  workingHours: {
    start: { type: String, default: '09:00 AM' },
    end: { type: String, default: '05:00 PM' }
  },
  // Custom available time slots (if empty, defaults are used)
  availableSlots: {
    type: [String],
    default: ['09:00 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '04:15 PM']
  },
  languages: {
    type: [String],
    default: ['English']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);

