const mongoose = require('mongoose');

const SlotReservationSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slot: {
    type: String,
    required: true
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Compound index to prevent concurrent holds on same slot
SlotReservationSchema.index({ doctor: 1, date: 1, slot: 1 }, { unique: true });

// TTL index to automatically release hold after expiration
SlotReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SlotReservation', SlotReservationSchema);
