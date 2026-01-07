const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false // Optional if this is a group/university chat
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University'
        // If present, this is a Group Chat for this university
    },
    content: {
        type: String,
        required: false
    },
    attachments: [{
        name: String,
        url: String
    }],
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
