const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    author: {
        name: String,
        role: { type: String, enum: ['student', 'mentor', 'consultant', 'admin'], default: 'student' }
    },
    content: {
        type: String,
        required: false
    },
    attachments: [{
        name: String,
        url: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
