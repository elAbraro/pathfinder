const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'consultant', 'superuser'],
    default: 'student'
  },
  // Consultant specific fields
  consultantProfile: {
    specialization: String,
    experienceYears: Number,
    bio: String,
    rating: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    skills: [String]
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    nationality: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  academicHistory: {
    currentEducationLevel: {
      type: String,
      enum: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate']
    },
    institution: String,
    gpa: { type: Number, min: 0, max: 4.0 },
    graduationYear: Number,
    transcripts: [String]
  },
  testScores: {
    sat: { type: Number, min: 400, max: 1600 },
    act: { type: Number, min: 1, max: 36 },
    toefl: { type: Number, min: 0, max: 120 },
    ielts: { type: Number, min: 0, max: 9 },
    gre: { type: Number, min: 260, max: 340 },
    gmat: { type: Number, min: 200, max: 800 }
  },
  interests: {
    desiredMajor: [String],
    careerGoals: String,
    preferredStudyDestinations: [String],
    campusPreferences: {
      type: [String],
      enum: ['Urban', 'Suburban', 'Rural', 'Large', 'Medium', 'Small']
    },
    extracurriculars: [String]
  },
  budget: {
    minTuition: Number,
    maxTuition: Number,
    currency: { type: String, default: 'USD' },
    financialAidRequired: { type: Boolean, default: false }
  },
  shortlistedUniversities: [{
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    fitScore: Number,
    addedAt: { type: Date, default: Date.now },
    applicationStatus: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'],
      default: 'Not Started'
    },
    notes: String,
    // Personal progress tracking
    myTimeline: [{
      stepName: String,
      status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Overdue'], default: 'Pending' },
      dueDate: Date, // Can be overridden
      completedDate: Date
    }],
    myChecklist: [{
      documentName: String,
      status: { type: String, enum: ['Pending', 'Uploaded', 'Verified'], default: 'Pending' },
      fileUrl: String,
      lastUpdated: Date
    }]
  }],
  isPremium: { type: Boolean, default: false },
  premiumSince: Date,
  testScoreHistory: [{
    scoreType: { type: String, enum: ['SAT', 'ACT', 'TOEFL', 'IELTS', 'GRE', 'GMAT'] },
    score: Number,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);