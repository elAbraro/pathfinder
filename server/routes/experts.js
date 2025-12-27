const express = require('express');
const router = express.Router();
const Expert = require('../models/expert');

// Get all experts
router.get('/', async (req, res) => {
    try {
        const experts = await Expert.find();
        res.json(experts);
    } catch (error) {
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
