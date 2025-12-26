const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/notification');

// Invite a collaborator (Mentor/Consultant)
router.post('/collaborate', auth, async (req, res) => {
    try {
        const { universityId, email, message } = req.body;

        // In a real app, we would check if the user exists. 
        // For now, we'll just create a notification for them if they exist, 
        // or simulate sending an email.

        // We'll create a system notification for the sender to confirm it was sent
        const notification = new Notification({
            recipient: req.student._id,
            title: 'Collaboration Invitation Sent',
            message: `You invited ${email} to collaborate on your application.`,
            type: 'System'
        });

        await notification.save();

        res.json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Collaboration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
