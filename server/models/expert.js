const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    specialization: { type: String },
    image: { type: String },
    availability: [{ type: String }] // e.g. ["Mon 10am", "Tue 2pm"]
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);
