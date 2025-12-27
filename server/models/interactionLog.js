const mongoose = require('mongoose');

const interactionLogSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    action: {
        type: String,
        enum: ['View', 'Shortlist', 'Apply', 'Search'],
        required: true
    },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the University or Resource
    targetName: { type: String }, // Snapshot of the name at that time
    dataVersion: { type: Number, required: true }, // The version of data the user saw
    metadata: { type: Object } // Extra info (e.g., search filters used)
}, { timestamps: true });

module.exports = mongoose.model('InteractionLog', interactionLogSchema);
