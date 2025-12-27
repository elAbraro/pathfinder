const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Deadline', 'Scholarship', 'System', 'Application'],
        default: 'System'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    actionLink: String // Optional link to redirect user
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
