const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/notification');
const Message = require('../models/message');

// Get chat history with a specific user
router.get('/messages/:withUserId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.student._id, recipient: req.params.withUserId },
                { sender: req.params.withUserId, recipient: req.student._id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/messages', auth, async (req, res) => {
    try {
        const { recipientId, content, attachments } = req.body;
        const message = new Message({
            sender: req.student._id,
            recipient: recipientId,
            content,
            attachments
        });
        await message.save();

        // Notify recipient
        try {
            await Notification.create({
                recipient: recipientId,
                title: 'New Message',
                message: `New message from ${req.student?.profile?.firstName || 'User'}`,
                type: 'Alert',
                relatedLink: '/collaboration'
            });
        } catch (nErr) { console.error('Notification Error:', nErr); }

        res.status(201).json(message);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

// Get recent chats for current user
router.get('/chats', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.student._id }, { recipient: req.student._id }]
        })
            .populate('sender', 'profile email')
            .populate('recipient', 'profile email')
            .sort({ createdAt: -1 });

        // Group by user
        const chats = [];
        const seen = new Set();

        messages.forEach(m => {
            const otherUser = m.sender._id.toString() === req.student._id.toString() ? m.recipient : m.sender;
            if (!seen.has(otherUser._id.toString())) {
                chats.push({
                    user: otherUser,
                    lastMessage: m
                });
                seen.add(otherUser._id.toString());
            }
        });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

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

// Search for potential collaborators
router.get('/users/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) return res.json([]);

        const Student = require('../models/student');
        const roleToSearch = req.student.role === 'student' ? 'consultant' : 'student';

        const users = await Student.find({
            role: roleToSearch,
            $or: [
                { 'profile.firstName': { $regex: query, $options: 'i' } },
                { 'profile.lastName': { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('profile email role').limit(10);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get University Group Chat Messages
router.get('/university/:uniId', auth, async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching messages for Uni ID: ${req.params.uniId}`);
        const messages = await Message.find({ university: req.params.uniId })
            .populate('sender', 'profile email role')
            .sort({ createdAt: 1 });
        console.log(`[DEBUG] Found ${messages.length} messages.`);
        messages.forEach(m => console.log(` - Msg: ${m._id}, Sender: ${m.sender?._id}, Uni: ${m.university}`));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Send University Group Chat Message
router.post('/university/:uniId', auth, async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const message = new Message({
            sender: req.student._id,
            university: req.params.uniId,
            content,
            attachments
        });
        await message.save();

        // Populate sender for immediate UI update
        await message.populate('sender', 'profile email role');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
