const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');

// Process Payment (Simulated Real Transaction)
router.post('/process', auth, async (req, res) => {
    try {
        const { amount, source, currency, planName } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Simulate multi-step verification
        // Step 1: Validating Card with Bank
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 2: Running Fraud Detection
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Finalizing Transaction
        await new Promise(resolve => setTimeout(resolve, 700));

        // Update User Status to Premium in DB
        const student = await Student.findById(req.student._id);
        if (!student) return res.status(404).json({ message: 'User not found' });

        student.isPremium = true;
        student.premiumSince = new Date();

        // Log the interaction
        const InteractionLog = require('../models/interactionLog');
        await InteractionLog.create({
            student: req.student._id,
            action: 'Upgrade',
            targetName: planName || 'Premium Plan',
            dataVersion: 1,
            metadata: { amount, currency, transactionDate: new Date() }
        });

        await student.save();

        res.json({
            success: true,
            message: 'Payment processed successfully',
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
            premiumStatus: true,
            plan: planName || 'Premium'
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Payment failed' });
    }
});

module.exports = router;
