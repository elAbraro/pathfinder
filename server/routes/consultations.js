const express = require('express');
const router = express.Router();
const Consultation = require('../models/consultation');
const auth = require('../middleware/auth');

// Get all sessions for current user
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await Consultation.find({ student: req.student._id }).sort({ date: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Book a session
router.post('/', auth, async (req, res) => {
    try {
        const { expertName, expertRole, date, topic } = req.body;

        const session = new Consultation({
            student: req.student._id,
            expertName,
            expertRole,
            date,
            topic
        });

        await session.save();

        // Trigger Notification
        try {
            const Notification = require('../models/notification');
            await Notification.create({
                recipient: req.student._id,
                message: `Consultation confirmed with ${expertName} on ${new Date(date).toLocaleDateString()}.`,
                type: 'Alert',
                relatedLink: '/consultation'
            });
        } catch (nErr) {
            console.error('Notification failed', nErr);
        }

        res.status(201).json(session);
    } catch (error) {
        console.error('Consultation booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel a session
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const session = await Consultation.findOne({ _id: req.params.id, student: req.student._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.status = 'Cancelled';
        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
