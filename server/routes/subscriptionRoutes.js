const express = require('express');
console.log("Loading Subscription Routes File...");
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan configurations
// Plan configurations
const PLANS = {
    free: {
        name: 'FoodHub Free',
        price: 0,
        features: {
            COD: false,
            refundPriority: false,
            extendedCancel: false,
        },
    },
    lite: {
        name: 'FoodHub Lite',
        price: 99,
        features: {
            COD: true,
            refundPriority: true,
            extendedCancel: true,
        },
    },
};

// @route   GET /api/subscriptions/plans
// @desc    Get all available plans
// @access  Public
router.get('/plans', (req, res) => {
    res.json(PLANS);
});

// @route   GET /api/subscriptions/my-subscription
// @desc    Get current user's subscription
// @access  Private
router.get('/my-subscription', protect, async (req, res) => {
    try {
        let subscription = await Subscription.findOne({ user: req.user._id });

        // Create free subscription if none exists
        if (!subscription) {
            subscription = new Subscription({
                user: req.user._id,
                plan: 'free',
                features: PLANS.free.features,
            });
            await subscription.save();
        }

        // Check if still active
        const isActive = subscription.isActive();
        const remainingOrders = await subscription.getRemainingOrders();

        res.json({
            subscription,
            isActive,
            remainingOrders: subscription.plan === 'free' ? remainingOrders : 'Unlimited',
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subscriptions/initiate OR /upgrade
// @desc    Initiate subscription upgrade (Create Razorpay Order)
// @access  Private
router.post(['/initiate', '/upgrade'], protect, async (req, res) => {
    try {
        const { plan } = req.body; // 'lite' or 'pro'

        if (!PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        if (plan === 'free') {
            return res.status(400).json({ message: 'Cannot upgrade to free plan' });
        }

        const planConfig = PLANS[plan];

        // Fix Receipt Length Issue (Max 40 chars)
        // sub (3) + _ (1) + userId (last 6) + _ (1) + timestamp (13) = 24 chars
        const shortNode = req.user._id.toString().slice(-6);
        const receiptId = `sub_${shortNode}_${Date.now()}`;

        // Create Razorpay order
        const options = {
            amount: planConfig.price * 100, // Convert to paise
            currency: 'INR',
            receipt: receiptId,
            notes: {
                userId: req.user._id.toString(),
                plan: plan,
                type: 'subscription_upgrade',
            },
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID, // Send key to frontend
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: plan,
            planName: planConfig.name,
            description: `Upgrade to ${planConfig.name}`,
        });
    } catch (error) {
        console.error('Initiate subscription error:', error);
        res.status(500).json({
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
});

// @route   POST /api/subscriptions/verify
// @desc    Verify payment and activate subscription (Client-side callback)
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
        } = req.body;

        // Verify signature
        const crypto = require('crypto');
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Payment valid - Activate Subscription
        const planConfig = PLANS[plan];

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 30 days validity

        // 1. Update/Create Subscription Document
        let subscription = await Subscription.findOne({ user: req.user._id });

        if (!subscription) {
            subscription = new Subscription({ user: req.user._id });
        }

        subscription.plan = plan;
        subscription.price = planConfig.price;
        subscription.status = 'active';
        subscription.startDate = startDate;
        subscription.endDate = endDate;
        subscription.paymentId = razorpay_payment_id;
        subscription.features = planConfig.features;
        subscription.autoRenew = true;

        await subscription.save();

        // 2. Update User Document (Redundancy as requested)
        await User.findByIdAndUpdate(req.user._id, {
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
            subscriptionExpiry: endDate,
            razorpaySubscriptionId: razorpay_payment_id // Using payment ID as proxy for now
        });

        res.json({
            success: true,
            message: `Successfully upgraded to ${planConfig.name}`,
            subscription,
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

// @route   POST /api/subscriptions/webhook
// @desc    Razorpay Webhook for payment.captured
// @access  Public
router.post('/webhook', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Must set this in .env

    // If no secret, we can't verify (or strict mode off)
    if (!secret) {
        return res.status(200).send('Webhook received but no secret config');
    }

    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        // Event Valid
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const notes = payment.notes;

            if (notes.type === 'subscription_upgrade') {
                const userId = notes.userId;
                const plan = notes.plan;

                // Perform activation logic here (similar to verify)
                // Since verify is usually called by client, this is backup/async
                console.log(`Webhook: Payment captured for User ${userId} Plan ${plan}`);

                // Logic to update DB if not already active
                // For now, we assume verify route handles it mostly.
            }
        }
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ status: 'invalid_signature' });
    }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user._id });

        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found' });
        }

        if (subscription.plan === 'free') {
            return res.status(400).json({ message: 'Cannot cancel free plan' });
        }

        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();

        res.json({
            message: 'Subscription cancelled. You can use it until the end date.',
            subscription,
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
