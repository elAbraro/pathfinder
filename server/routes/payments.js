const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Process Payment (Mock)
router.post('/process', auth, async (req, res) => {
    try {
        const { amount, currency, paymentMethodId } = req.body;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock success
        res.json({
            success: true,
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
            amount,
            currency,
            status: 'paid'
        });
    } catch (error) {
        res.status(500).json({ message: 'Payment failed' });
    }
});

module.exports = router;
