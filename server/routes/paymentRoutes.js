const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (Step 1: Before payment)
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        // Validate amount
        if (!amount || amount < 1) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1, // Auto capture payment
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID, // Send key to frontend
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message,
        });
    }
});

// Verify Payment (Step 2: After payment)
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
            });
        } else {
            // Invalid signature
            res.status(400).json({
                success: false,
                message: 'Payment verification failed - Invalid signature',
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message,
        });
    }
});

// Get Payment Details
router.get('/payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await razorpay.payments.fetch(paymentId);

        res.status(200).json({
            success: true,
            payment: payment,
        });
    } catch (error) {
        console.error('Fetch payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details',
            error: error.message,
        });
    }
});

// Refund Payment (if needed)
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, amount } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined, // Partial or full refund
        });

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            refund: refund,
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund failed',
            error: error.message,
        });
    }
});

module.exports = router;
