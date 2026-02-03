const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plan: {
            type: String,
            enum: ['free', 'lite', 'pro'],
            default: 'free',
        },
        price: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        autoRenew: {
            type: Boolean,
            default: true,
        },
        paymentId: String,
        razorpaySubscriptionId: String,
        features: {
            maxOrdersPerMonth: {
                type: Number,
                default: 2, // Free plan limit
            },
            freeDeliveryThreshold: {
                type: Number,
                default: null, // null = no free delivery
            },
            cashbackPercentage: {
                type: Number,
                default: 0,
            },
            prioritySupport: {
                type: Boolean,
                default: false,
            },
            exclusiveRestaurants: {
                type: Boolean,
                default: false,
            },
        },
    },
    { timestamps: true }
);

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
    if (this.status !== 'active') return false;
    if (this.plan === 'free') return true;
    if (this.endDate && this.endDate < new Date()) {
        this.status = 'expired';
        this.save();
        return false;
    }
    return true;
};

// Method to get remaining orders for the month
subscriptionSchema.methods.getRemainingOrders = async function () {
    if (this.plan !== 'free') return Infinity;

    const Order = mongoose.model('Order');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const ordersThisMonth = await Order.countDocuments({
        user: this.user,
        createdAt: { $gte: startOfMonth },
    });

    return Math.max(0, this.features.maxOrdersPerMonth - ordersThisMonth);
};

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
