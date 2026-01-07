const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');
const University = require('../models/university');

const authorize = require('../middleware/authorize');

// Routes now use centralized authorize middleware
// Note: superusers are automatically allowed by the authorize middleware

// Get System Stats
router.get('/stats', auth, authorize('admin'), async (req, res) => {
    try {
        const studentCount = await Student.countDocuments({ role: 'student' });
        const consultantCount = await Student.countDocuments({ role: 'consultant' });
        const universityCount = await University.countDocuments();
        const premiumCount = await Student.countDocuments({ isPremium: true });

        const activeCount = await Student.countDocuments({
            role: 'student',
            $or: [
                { 'profile.phone': { $exists: true } },
                { 'profile.address.country': { $exists: true } }
            ]
        });

        const stats = {
            totalStudents: studentCount,
            totalConsultants: consultantCount,
            totalCounselors: consultantCount, // Alias for transition safety
            totalUniversities: universityCount,
            activeUsers: activeCount,
            premiumUsers: premiumCount
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add University (Admin)
router.post('/university', auth, authorize('admin'), async (req, res) => {
    try {
        const university = new University(req.body);
        await university.save();
        res.status(201).json(university);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Trigger Data Pipeline (Admin)
router.post('/run-pipeline', auth, authorize('admin'), async (req, res) => {
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

// Get All Users (Admin/Superuser)
router.get('/users', auth, authorize('admin'), async (req, res) => {
    try {
        const users = await Student.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User (Superuser Only for safety)
router.delete('/user/:id', auth, authorize('superuser'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion if needed, or allow it for superuser
        await Student.findByIdAndDelete(req.params.id);

        // Optionally delete related data like applications, consultations if exists
        // This makes it a "superpower" delete

        res.json({ message: `User ${student.email} and their data deleted successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
