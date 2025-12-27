const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    name: { type: String, required: true },
    provider: { type: String, required: true }, // University or Organization
    amount: { type: String, required: true }, // e.g. "$10,000" or "Full Tuition"
    deadline: { type: Date },
    eligibility: { type: String },
    description: { type: String },
    country: { type: String },
    major: { type: String },
    link: { type: String },
    type: { type: String, enum: ['Merit', 'Need-Based', 'Research', 'Sports', 'Other'], default: 'Merit' }
}, { timestamps: true });

// Text index for search
scholarshipSchema.index({ name: 'text', provider: 'text', description: 'text' });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
