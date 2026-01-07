const express = require('express');
const router = express.Router();
const Expert = require('../models/expert');
const Student = require('../models/student');

// Get all experts/counselors
router.get('/', async (req, res) => {
    try {
        // Fetch static experts
        const staticExperts = await Expert.find();

        // Fetch registered consultants from Student model
        const dbConsultants = await Student.find({ role: 'consultant' })
            .select('profile email counselorProfile');

        // Map them to a common format
        const consultants = dbConsultants.map(c => ({
            _id: c._id,
            name: `${c.profile.firstName} ${c.profile.lastName}`,
            role: c.counselorProfile?.specialization || 'Counselor',
            specialization: c.counselorProfile?.specialization || 'General Guidance',
            isUser: true // Flag to distinguish from static experts
        }));

        res.json([...staticExperts, ...consultants]);
    } catch (error) {
        console.error('Fetch experts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Seed experts (internal use)
router.post('/seed', async (req, res) => {
    try {
        const count = await Expert.countDocuments();
        if (count > 0) return res.json({ message: 'Experts already seeded' });

        const experts = [
            { name: 'Dr. Sarah Smith', role: 'Senior Counselor', specialization: 'Ivy League Admissions' },
            { name: 'Mr. John Doe', role: 'Visa Expert', specialization: 'F1 & H1B Visas' },
            { name: 'Ms. Emily Chen', role: 'Essay Specialist', specialization: 'Creative Writing' },
            { name: 'Prof. David Lee', role: 'Career Coach', specialization: 'STEM Careers' }
        ];

        await Expert.insertMany(experts);
        res.json({ message: 'Experts seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
