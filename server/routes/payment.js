const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');

// Process Payment (Simulated Real Transaction)
router.post('/process', auth, async (req, res) => {
    try {
        const { amount, source, currency } = req.body;

        // In a real integration, here we would call Stripe/PayPal API
        // const charge = await stripe.charges.create({ amount, currency, source });

        // For this project, we validate and "process" internally
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update User Status to Premium in DB
        const student = await Student.findById(req.student._id);
        if (!student) return res.status(404).json({ message: 'User not found' });

        student.isPremium = true;
        student.premiumSince = new Date();
        await student.save();

        res.json({
            success: true,
            message: 'Payment processed successfully',
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
            premiumStatus: true
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Payment failed' });
    }
});

module.exports = router;
