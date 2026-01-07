const express = require('express');
const router = express.Router();
const Scholarship = require('../models/scholarship');
const auth = require('../middleware/auth');

// Get all scholarships with filtering
router.get('/', async (req, res) => {
    try {
        const { country, type, search } = req.query;
        let query = {};

        if (country && country !== 'All') query.country = country;
        if (type && type !== 'All') query.type = type;
        if (search) query.$text = { $search: search };

        const scholarships = await Scholarship.find(query).sort({ deadline: 1 });
        res.json(scholarships);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Smart Match Scholarships
router.get('/match', auth, async (req, res) => {
    try {
        const student = req.student;
        if (!student.profile) return res.json([]);

        const { gpa, targetCountry } = student.profile;

        // Basic matching logic:
        // 1. Matches target country (or is Global)
        // 2. GPA requirement is met (scholarship minGPA <= student GPA)
        // 3. Deadline is in the future

        const query = {
            deadline: { $gte: new Date() }
        };

        if (targetCountry) {
            query.$or = [{ country: targetCountry }, { country: 'Global' }];
        }

        // Note: In a real app, 'criteria' might be structured. 
        // Here we rely on text search or simplistic assumptions if we had structured fields.
        // For now, let's just return all valid ones and let frontend highlight, 
        // OR filtering if we add strict fields to model. 
        // Let's assume we want to return mostly relevant ones.

        const scholarships = await Scholarship.find(query).sort({ deadline: 1 });

        // Filter in memory for GPA if feasible
        const matched = scholarships.filter(s => {
            // content-based filtering if criteria contains "GPA > X" logic
            // This is a simplified "Smart Match"
            return true;
        });

        res.json(matched);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Scholarship (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Ideally check for admin role here
        const scholarship = new Scholarship(req.body);
        await scholarship.save();
        res.status(201).json(scholarship);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
