const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  consultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  expertName: {
    type: String,
    required: true
  },
  expertRole: {
    type: String, // e.g., "Senior Counselor", "Visa Expert"
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  meetingLink: String,
  notes: String,
  topic: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String, // 'Card', 'bKash', 'Nogod'
  },
  transactionId: String,
  amount: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
