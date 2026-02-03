const express = require('express');
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
const PLANS = {
    free: {
        name: 'FoodHub Free',
        price: 0,
        features: {
            maxOrdersPerMonth: 2,
            freeDeliveryThreshold: null,
            cashbackPercentage: 0,
            prioritySupport: false,
            exclusiveRestaurants: false,
        },
    },
    lite: {
        name: 'FoodHub Lite',
        price: 99,
        features: {
            maxOrdersPerMonth: Infinity,
            freeDeliveryThreshold: 200,
            cashbackPercentage: 5,
            prioritySupport: false,
            exclusiveRestaurants: false,
        },
    },
    pro: {
        name: 'FoodHub Pro',
        price: 299,
        features: {
            maxOrdersPerMonth: Infinity,
            freeDeliveryThreshold: 0, // Free on all orders
            cashbackPercentage: 15,
            prioritySupport: true,
            exclusiveRestaurants: true,
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

// @route   POST /api/subscriptions/upgrade
// @desc    Upgrade to Lite or Pro plan
// @access  Private
router.post('/upgrade', protect, async (req, res) => {
    try {
        const { plan } = req.body; // 'lite' or 'pro'

        if (!PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        if (plan === 'free') {
            return res.status(400).json({ message: 'Cannot upgrade to free plan' });
        }

        const planConfig = PLANS[plan];

        // Create Razorpay order
        const options = {
            amount: planConfig.price * 100, // Convert to paise
            currency: 'INR',
            receipt: `sub_${req.user._id}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan: plan,
                type: 'subscription',
            },
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: plan,
            planName: planConfig.name,
        });
    } catch (error) {
        console.error('Upgrade plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subscriptions/verify-payment
// @desc    Verify subscription payment and activate
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
        } = req.body;

        // Verify signature (same as payment verification)
        const crypto = require('crypto');
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Payment verified! Activate subscription
        const planConfig = PLANS[plan];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        let subscription = await Subscription.findOne({ user: req.user._id });

        if (subscription) {
            // Update existing subscription
            subscription.plan = plan;
            subscription.price = planConfig.price;
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = endDate;
            subscription.paymentId = razorpay_payment_id;
            subscription.features = planConfig.features;
        } else {
            // Create new subscription
            subscription = new Subscription({
                user: req.user._id,
                plan: plan,
                price: planConfig.price,
                status: 'active',
                startDate: new Date(),
                endDate: endDate,
                paymentId: razorpay_payment_id,
                features: planConfig.features,
            });
        }

        await subscription.save();

        // Update user subscription reference
        await User.findByIdAndUpdate(req.user._id, {
            subscription: subscription._id,
            subscriptionPlan: plan,
        });

        res.json({
            success: true,
            message: `Successfully upgraded to ${planConfig.name}!`,
            subscription,
        });
    } catch (error) {
        console.error('Verify subscription payment error:', error);
        res.status(500).json({ message: 'Server error' });
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
