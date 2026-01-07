const mongoose = require('mongoose');

const dataSnapshotSchema = new mongoose.Schema({
    version: { type: Number, required: true, unique: true },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Published', 'Archived'],
        default: 'Pending'
    },
    source: { type: String, default: 'Automated Scraper' },
    data: [{ type: Object }], // Stores the raw university data objects
    changeLog: { type: String }, // Summary of changes (e.g., "Added 5 universities, Updated 10")
    createdBy: { type: String, default: 'System' },
    publishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DataSnapshot', dataSnapshotSchema);
