const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');
const University = require('../models/university');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.student && req.student.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Get System Stats
router.get('/stats', auth, checkAdmin, async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const universityCount = await University.countDocuments();

        // Mock analytics
        const stats = {
            totalStudents: studentCount,
            totalUniversities: universityCount,
            activeUsers: Math.floor(studentCount * 0.7),
            premiumUsers: Math.floor(studentCount * 0.1)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add University (Admin)
router.post('/university', auth, checkAdmin, async (req, res) => {
    try {
        const university = new University(req.body);
        await university.save();
        res.status(201).json(university);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Trigger Data Pipeline (Admin)
router.post('/run-pipeline', auth, checkAdmin, async (req, res) => {
    try {
        // Run asynchronously to avoid timeout
        const { syncData } = require('../services/dataSync');

        // We trigger it but don't wait for completion in the response
        // In a real app, we'd use a queue. Here we just set off the process.
        syncData().catch(err => console.error('Manual pipeline run failed:', err));

        res.json({ message: 'Data pipeline triggered successfully. Check logs/notifications for completion.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
