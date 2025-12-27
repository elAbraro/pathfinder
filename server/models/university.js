const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String,
    required: true
  },
  city: String,
  ranking: {
    dataset: [{
      provider: { type: String, enum: ['QS', 'THE', 'ARWU', 'USNews', 'Simulated', 'Simulated Global', 'OpenAlex Proxy'] },
      rank: Number,
      year: Number
    }],
    // Aggregated/Normalized for easy display
    global: Number,
    national: Number
  },

  researchMetrics: {
    hIndex: Number,
    citations: Number,
    worksCount: Number,
    i10Index: Number,
    source: { type: String, default: 'OpenAlex' },
    lastUpdated: Date
  },

  pipelineMetadata: {
    lastUpdated: Date,
    sources: [String], // e.g. ['Hipo', 'OpenAlex', 'RankingSim']
    processingErrors: [String]
  },

  logo: String,
  images: [String],
  description: String,

  academics: {
    majorsOffered: [String],
    coursesHighlight: [{
      name: String,
      description: String,
      duration: String
    }],
    facultyStrength: Number,
    studentTeacherRatio: String
  },

  admissions: {
    acceptanceRate: Number,
    applicationDeadlines: [{
      term: { type: String, enum: ['Fall', 'Spring', 'Summer', 'Winter'] },
      deadline: Date,
      year: Number
    }],
    requirements: {
      minGPA: Number,
      testScores: {
        sat: { min: Number, max: Number },
        act: { min: Number, max: Number },
        toefl: { min: Number },
        ielts: { min: Number },
        gre: { min: Number },
        gmat: { min: Number }
      },
      documents: [String],
      essayRequired: Boolean,
      interviewRequired: Boolean
    },
    applicationTimeline: [{
      stepName: String, // e.g., "Submit Application", "Submit Transcripts"
      description: String,
      deadlineDate: Date,
      isMandatory: { type: Boolean, default: true }
    }],
    documentChecklist: [{
      documentName: String,
      description: String,
      isRequired: { type: Boolean, default: true },
      format: String // e.g., "PDF", "Official Score Report"
    }]
  },

  financials: {
    tuitionFee: {
      domestic: { min: Number, max: Number },
      international: { min: Number, max: Number },
      currency: { type: String, default: 'USD' }
    },
    scholarships: [{
      name: String,
      amount: Number,
      criteria: String,
      deadline: Date
    }],
    financialAidAvailable: Boolean
  },

  campusLife: {
    location: String,
    campusType: { type: String, enum: ['Urban', 'Suburban', 'Rural'] },
    campusSize: String,
    studentPopulation: Number,
    internationalStudents: Number,
    housingAvailable: Boolean,
    facilities: [String],
    clubs: [String],
    sports: [String]
  },

  outcomes: {
    employmentRate: Number,
    averageSalary: Number,
    topEmployers: [String],
    alumniNetwork: Number
  },

  testimonials: [{
    studentName: String,
    graduationYear: Number,
    major: String,
    testimonial: String,
    rating: { type: Number, min: 1, max: 5 }
  }],

  contact: {
    website: String,
    email: String,
    phone: String,
    admissionsOffice: String
  }
}, {
  timestamps: true
});

// Index for search optimization
universitySchema.index({ name: 'text', 'academics.majorsOffered': 'text', country: 1 });

module.exports = mongoose.models.University || mongoose.model('University', universitySchema);