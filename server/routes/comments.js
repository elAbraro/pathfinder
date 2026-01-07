const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/comment');

// Get comments for a specific application (university + student)
router.get('/:universityId', auth, async (req, res) => {
    try {
        const { studentId } = req.query;
        let targetStudentId = req.student._id;

        // If counselor, they can specify which student's application they are viewing
        if (req.student.role === 'consultant' && studentId) {
            targetStudentId = studentId;
        }

        const comments = await Comment.find({
            universityId: req.params.universityId,
            studentId: targetStudentId
        }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new comment
router.post('/', auth, async (req, res) => {
    try {
        const { universityId, content, attachments, studentId } = req.body;

        let targetStudentId = req.student._id;
        if (req.student.role === 'consultant' && studentId) {
            targetStudentId = studentId;
        }

        const comment = new Comment({
            universityId,
            studentId: targetStudentId,
            author: {
                name: (req.student.profile?.firstName ? `${req.student.profile.firstName} ${req.student.profile.lastName || ''}` : 'Consultant'),
                role: req.student.role || 'student'
            },
            content,
            attachments
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        console.error('Post Comment Error:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

module.exports = router;
