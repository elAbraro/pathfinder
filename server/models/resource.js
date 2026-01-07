const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Video', 'Article', 'PDF', 'Guide', 'Practice Test'],
        required: true
    },
    category: {
        type: String,
        enum: ['General', 'IELTS', 'TOEFL', 'SAT', 'GRE', 'GMAT', 'Essay', 'Visa'],
        required: true
    },
    description: String,
    url: {
        type: String,
        required: true
    },
    thumbnail: String,
    tags: [String],
    isPremium: {
        type: Boolean,
        default: false
    },
    estimatedReadTime: String, // e.g. "10 mins"
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for searching
resourceSchema.index({ title: 'text', description: 'text', category: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
