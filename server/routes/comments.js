const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/comment');

// Get comments for a specific application (university + student)
router.get('/:universityId', auth, async (req, res) => {
    try {
        const comments = await Comment.find({
            universityId: req.params.universityId,
            studentId: req.student._id
        }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new comment
router.post('/', auth, async (req, res) => {
    try {
        const { universityId, content, attachments } = req.body;

        const comment = new Comment({
            universityId,
            studentId: req.student._id,
            author: {
                name: (req.student.firstName ? `${req.student.firstName} ${req.student.lastName || ''}` : 'Student'),
                role: req.student.role || 'student'
            },
            content,
            attachments
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
