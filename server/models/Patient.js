const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  dob: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify gender']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please add blood group']
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  bloodPressureRecords: [
    {
      date: { type: Date, default: Date.now },
      systolic: Number,
      diastolic: Number
    }
  ],
  weightRecords: [
    {
      date: { type: Date, default: Date.now },
      weight: Number
    }
  ],
  glucoseRecords: [
    {
      date: { type: Date, default: Date.now },
      level: Number
    }
  ]
});

module.exports = mongoose.model('Patient', PatientSchema);
