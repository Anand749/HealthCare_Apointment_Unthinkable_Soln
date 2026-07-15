const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'retrying'],
    default: 'retrying'
  },
  attempts: {
    type: Number,
    default: 1
  },
  errorLog: {
    type: String,
    default: ''
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);

