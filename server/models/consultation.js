const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
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
  topic: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
