const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Validate Coupon
router.post('/validate', protect, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        if (!code) {
            return res.status(400).json({ valid: false, message: 'Coupon code is required' });
        }

        const normalizedCode = code.toUpperCase();

        if (normalizedCode === 'NEWBIE' || normalizedCode === 'WELCOME50') {
            // Check order history
            const orderCount = await Order.countDocuments({ user: userId });

            if (orderCount > 0) {
                return res.status(400).json({
                    valid: false,
                    message: 'This offer is only valid for your first order.'
                });
            }

            return res.json({
                valid: true,
                code: normalizedCode,
                discountType: 'PERCENTAGE',
                value: 50, // 50%
                maxDiscount: 150, // Max ₹150
                message: 'Newbie offer applied! 50% OFF (up to ₹150)'
            });
        }

        // Future: Database check for other coupons
        // const coupon = await Coupon.findOne({ code: normalizedCode });

        return res.status(400).json({ valid: false, message: 'Invalid coupon code' });

    } catch (error) {
        console.error("Coupon validation error:", error);
        res.status(500).json({ valid: false, message: 'Server error validating coupon' });
    }
});

module.exports = router;
