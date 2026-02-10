const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Hotel = require('../models/Hotel');
const { protect, restrictTo } = require('../middleware/auth');

// ============================================
// RESTAURANT-SPECIFIC ORDER ENDPOINTS
// Security: JWT + role='restaurant' + ownership check
// ============================================

/**
 * GET /api/restaurant/orders
 * Fetch orders for the restaurant owned by the logged-in user.
 * Filters: ?status=pending, ?status=accepted, etc.
 */
router.get('/orders', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        // 1. Find the hotel linked to this user
        const hotel = await Hotel.findOne({ user: req.user._id });
        if (!hotel) {
            // Legacy fallback: Try by email
            const hotelByEmail = await Hotel.findOne({ email: req.user.email });
            if (!hotelByEmail) {
                return res.status(404).json({ success: false, message: 'No restaurant profile found for this user.' });
            }
            req.hotelId = hotelByEmail._id;
        } else {
            req.hotelId = hotel._id;
        }

        // 2. Build filter
        const filter = { hotel: req.hotelId };
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // 3. Fetch orders (only paid orders should be shown to restaurant by default)
        // But for testing, we might want to see all. Let's filter by paymentStatus='paid' for production-readiness.
        // filter.paymentStatus = 'paid'; // Uncomment for production

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(100); // Limit for performance

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error('Restaurant Orders Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching orders.' });
    }
});

/**
 * PATCH /api/restaurant/orders/:orderId/accept
 * Accept an order. Sets status to 'accepted'.
 */
router.patch('/orders/:orderId/accept', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { orderId } = req.params;

        // 1. Verify restaurant ownership
        const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
        if (!hotel) {
            return res.status(403).json({ success: false, message: 'Restaurant not found.' });
        }

        // 2. Find order and verify it belongs to this restaurant
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (order.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to modify this order.' });
        }

        // 3. Verify order is in 'pending' or 'PLACED' status
        const acceptableStatuses = ['pending', 'PLACED', 'placed'];
        if (!acceptableStatuses.includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot accept order. Current status: ${order.status}` });
        }

        // 4. Update status
        order.status = 'accepted';
        order.acceptedAt = new Date();
        await order.save();

        res.json({ success: true, message: 'Order accepted successfully!', order });
    } catch (error) {
        console.error('Accept Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept order.' });
    }
});

/**
 * PATCH /api/restaurant/orders/:orderId/reject
 * Reject an order. Sets status to 'rejected' and triggers refund.
 */
router.patch('/orders/:orderId/reject', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        // 1. Verify restaurant ownership
        const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
        if (!hotel) {
            return res.status(403).json({ success: false, message: 'Restaurant not found.' });
        }

        // 2. Find order and verify ownership
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (order.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to modify this order.' });
        }

        // 3. Verify order is in 'pending' or 'PLACED' status
        const rejectableStatuses = ['pending', 'PLACED', 'placed'];
        if (!rejectableStatuses.includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot reject order. Current status: ${order.status}` });
        }

        // 4. Auto-Refund if payment was made
        let refundInitiated = false;
        if (order.paymentStatus === 'paid' && order.razorpayPaymentId) {
            try {
                const Razorpay = require('razorpay');
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });

                const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
                    amount: order.totalAmount * 100, // Razorpay expects paise
                    speed: 'normal',
                    notes: {
                        reason: reason || 'Order rejected by restaurant',
                        orderId: order._id.toString()
                    }
                });

                order.refundId = refund.id;
                order.refundAmount = order.totalAmount;
                order.refundStatus = 'initiated';
                order.paymentStatus = 'refunded';
                refundInitiated = true;
                console.log(`Refund initiated for order ${order._id}: Refund ID ${refund.id}`);
            } catch (refundError) {
                console.error('Refund Error:', refundError);
                // Continue with rejection even if refund fails (admin can manually refund)
            }
        }

        // 5. Update status
        order.status = 'rejected';
        order.rejectedAt = new Date();
        order.rejectionReason = reason || 'Item unavailable';
        await order.save();

        res.json({
            success: true,
            message: 'Order rejected.',
            refundInitiated,
            order
        });
    } catch (error) {
        console.error('Reject Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject order.' });
    }
});

/**
 * PATCH /api/restaurant/orders/:orderId/status
 * Update order status (preparing, ready, out-for-delivery, delivered)
 * Only allowed after order is 'accepted'.
 */
router.patch('/orders/:orderId/status', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['preparing', 'ready', 'out-for-delivery', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
        }

        // 1. Verify restaurant ownership
        const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
        if (!hotel) {
            return res.status(403).json({ success: false, message: 'Restaurant not found.' });
        }

        // 2. Find and verify order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (order.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        // 3. Validate transition (must be accepted first)
        if (['pending', 'PLACED', 'placed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Please accept the order first.' });
        }

        if (['rejected', 'cancelled', 'delivered', 'REJECTED', 'CANCELLED', 'DELIVERED'].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot update status from '${order.status}'.` });
        }

        // 4. Update
        order.status = status;
        await order.save();

        res.json({ success: true, message: `Order status updated to '${status}'.`, order });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
});

/**
 * GET /api/restaurant/menu-status
 * Check the status of menu onboarding.
 */
router.get('/menu-status', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
        if (!hotel) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        res.json({
            success: true,
            status: hotel.menuStatus,
            menuLink: hotel.menuLink,
            menuText: hotel.menuText,
            adminNotes: hotel.adminNotes
        });
    } catch (error) {
        console.error('Menu Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/restaurant/menu-setup
 * Submit menu for admin setup (Link or Text).
 */
router.post('/menu-setup', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { menuLink, menuText } = req.body;

        const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
        if (!hotel) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        if (!menuLink && !menuText) {
            return res.status(400).json({ success: false, message: 'Please provide a menu link or text description.' });
        }

        hotel.menuLink = menuLink || hotel.menuLink;
        hotel.menuText = menuText || hotel.menuText;
        hotel.menuStatus = 'PENDING_SETUP'; // Reset to pending if they update it

        await hotel.save();

        res.json({ success: true, message: 'Menu submitted for setup. Admin will review shortly.' });
    } catch (error) {
        console.error('Menu Setup Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
