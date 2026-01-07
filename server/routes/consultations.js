const express = require('express');
const router = express.Router();
const Consultation = require('../models/consultation');
const auth = require('../middleware/auth');

// Get all sessions for current user
router.get('/', auth, async (req, res) => {
    try {
        const query = req.student.role === 'consultant'
            ? { consultant: req.student._id }
            : { student: req.student._id };

        const sessions = await Consultation.find(query)
            .populate('student', 'profile email')
            .populate('consultant', 'profile email')
            .sort({ updatedAt: -1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get availability for an expert (publicly viewable busy slots)
router.get('/availability/:expertId', auth, async (req, res) => {
    try {
        const slots = await Consultation.find({
            consultant: req.params.expertId,
            status: 'Scheduled',
            date: { $gte: new Date() } // Only future slots
        }).select('date durationMinutes');

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability' });
    }
});

// Book a session
router.post('/', auth, async (req, res) => {
    try {
        const { expertId, expertName, expertRole, date, topic, paymentMethod, transactionId, amount } = req.body;

        // Check for double booking with strictly non-overlapping time range
        // Check for double booking with overlapping time range
        const requestedStart = new Date(date);

        // Enforce Working Hours (e.g., 9 AM to 6 PM)
        const hour = requestedStart.getHours();
        if (hour < 9 || hour >= 18) {
            return res.status(400).json({ message: 'Bookings only allowed between 9 AM and 6 PM.' });
        }

        const duration = 60; // Fixed 60 minutes per session
        const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

        // Check if the requested time is in the past
        if (requestedStart < new Date()) {
            return res.status(400).json({ message: 'Cannot book a session in the past.' });
        }

        // Overlap Check: (StartA < EndB) and (EndA > StartB)
        const conflict = await Consultation.findOne({
            consultant: expertId,
            status: 'Scheduled',
            $or: [
                { date: { $lt: requestedEnd, $gte: requestedStart } }, // Starts during requested
                {
                    date: { $lt: requestedStart }, // Starts before requested...
                    $expr: {
                        $gt: [
                            { $add: ["$date", { $multiply: ["$durationMinutes", 60000] }] }, // ...and ends after requested start
                            requestedStart
                        ]
                    }
                }
            ]
        });

        // Simpler Logic for standard duration: 
        // We can just check if any existing meeting starts within [reqStart - 59min, reqEnd - 1min]
        // But the robust way is better. Let's stick to a simpler safe query for now to avoid $expr complexity issues if durationMinutes isn't consistent.
        // Actually, assuming all sessions are 60 mins makes it easier.
        // Let's use a standard range check assuming existing sessions have a 'date' field.

        const existingSession = await Consultation.findOne({
            consultant: expertId,
            status: 'Scheduled',
            date: {
                $lt: requestedEnd,
                $gt: new Date(requestedStart.getTime() - 60 * 60000) // Assumes existing sessions are also ~60 mins max logic
            }
        });

        // Wait, the most robust way relying only on start time 'date' and assuming 60m duration:
        // Any meeting starting in (requestedStart - 60min) < existingStart < requestedStart + 60min will overlap.

        const overlapCheck = await Consultation.findOne({
            consultant: expertId,
            status: 'Scheduled',
            date: {
                $gt: new Date(requestedStart.getTime() - 60 * 60000), // Ex: If req is 10:00, check > 9:00
                $lt: requestedEnd // check < 11:00
            }
        });

        if (overlapCheck) {
            return res.status(400).json({ message: 'Time slot overlaps with another session.' });
        }

        const session = new Consultation({
            student: req.student._id,
            consultant: expertId,
            expertName,
            expertRole,
            date,
            topic,
            paymentStatus: 'Completed',
            paymentMethod,
            transactionId,
            amount
        });

        await session.save();

        // Dual Notifications
        try {
            const Notification = require('../models/notification');

            // Notify Student
            await Notification.create({
                recipient: req.student._id,
                title: 'Booking & Payment Confirmed',
                message: `Your session with ${expertName} on ${new Date(date).toLocaleString()} is confirmed. Payment BDT ${amount} via ${paymentMethod} received.`,
                type: 'Booking',
                relatedLink: '/consultation'
            });

            // Notify Counselor
            if (expertId) {
                await Notification.create({
                    recipient: expertId,
                    title: 'New Paid Booking',
                    message: `New booking from ${req.student.profile.firstName} for ${new Date(date).toLocaleString()}. Payment BDT ${amount} confirmed (TXN: ${transactionId}).`,
                    type: 'Booking',
                    relatedLink: '/counselor/dashboard'
                });
            }
        } catch (nErr) {
            console.error('Dual notification failed:', nErr);
        }

        res.status(201).json(session);
    } catch (error) {
        console.error('Consultation booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update session details (Link, Notes)
router.put('/:id/update', auth, async (req, res) => {
    try {
        const session = await Consultation.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Only consultant can update details
        if (session.consultant.toString() !== req.student._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { meetingLink, notes } = req.body;
        if (meetingLink !== undefined) session.meetingLink = meetingLink;
        if (notes !== undefined) session.notes = notes;

        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark session as complete
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const session = await Consultation.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.consultant.toString() !== req.student._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        session.status = 'Completed';
        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel a session
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const session = await Consultation.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Authorization check: User must be the student or the consultant
        const isStudent = session.student.toString() === req.student._id.toString();
        const isConsultant = session.consultant.toString() === req.student._id.toString();

        if (!isStudent && !isConsultant) {
            return res.status(403).json({ message: 'Unauthorized to cancel this session' });
        }

        session.status = 'Cancelled';
        await session.save();

        // Notify the other party
        try {
            const Notification = require('../models/notification');
            const recipientId = isStudent ? session.consultant : session.student;
            const senderName = req.student.profile.firstName;

            // Only notify if recipient exists and is not a static expert ID (if we wanted to be strict)
            // But usually registered experts have a Student ID
            if (recipientId) {
                await Notification.create({
                    recipient: recipientId,
                    title: 'Consultation Cancelled',
                    message: `Consultation on ${new Date(session.date).toLocaleDateString()} was cancelled by ${senderName}.`,
                    type: 'Alert',
                    relatedLink: isStudent ? '/counselor/dashboard' : '/consultation'
                });
            }
        } catch (nErr) {
            console.error('Notification failed', nErr);
        }

        res.json(session);
    } catch (error) {
        console.error('Cancellation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
