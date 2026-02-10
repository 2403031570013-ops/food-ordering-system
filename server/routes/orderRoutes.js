const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


const { protect, restrictTo } = require("../middleware/auth");

const Razorpay = require('razorpay');

// Initialize Razorpay instance (Ensure keys are present)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (Typically handled by Payment Flow, but useful for testing or Cash on Delivery)
router.post("/", protect, async (req, res) => {
  try {
    const order = new Order({ ...req.body, user: req.user._id });
    await order.save();
    res.status(201).json({ message: "Order saved", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Order (User Side)
router.post("/:id/cancel", protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // defined allowed/cancellable statuses
    const cancellableStatuses = ['PLACED', 'PREPARING', 'pending', 'confirmed', 'preparing', 'accepted'];
    // explicitly blocked statuses
    const nonCancellableStatuses = ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'out-for-delivery', 'delivered', 'cancelled'];

    if (nonCancellableStatuses.includes(order.status) || !cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage.",
        currentStatus: order.status
      });
    }

    // --- Refund Logic ---
    let refundMessage = "Order cancelled successfully.";

    // 1. ONLINE PAYMENT REFUND
    if (order.paymentMethod === 'ONLINE' && (order.paymentStatus === 'paid' || order.paymentStatus === 'COMPLETED')) {
      try {
        if (!order.razorpayPaymentId) {
          console.error("Missing razorpayPaymentId for paid order:", order._id);
          // Just cancel, but flag error?
          refundMessage += " Payment ID missing, cannot auto-refund. Contact support.";
        } else {
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            speed: 'optimum',
            notes: {
              reason: 'User Cancelled Order',
              orderId: order._id.toString()
            }
          });

          order.refundId = refund.id;
          order.refundAmount = refund.amount / 100;
          // Map Razorpay status to our enum
          order.refundStatus = refund.status === 'processed' ? 'COMPLETED' : 'PROCESSING';
          order.paymentStatus = 'REFUNDED';
          refundMessage += " Refund initiated.";
        }
      } catch (rzpError) {
        console.error("Razorpay refund failed:", rzpError);
        refundMessage += " Auto-refund failed. Please contact support.";
        // We still cancel the order but maybe flag it?
      }
    }
    // 2. COD REFUND REQ (If preparing)
    else if (order.paymentMethod === 'COD' && (order.status === 'PREPARING' || order.status === 'preparing')) {
      // Mark for Admin Review
      order.refundStatus = 'PROCESSING'; // Using PROCESSING to flag 'COD_REFUND_REQUIRED'
      refundMessage += " Cancellation subject to cancellation fee review.";
    }

    order.status = 'CANCELLED';
    order.cancellationReason = reason || 'User requested cancellation';

    await order.save();

    res.json({
      success: true,
      message: refundMessage,
      order
    });

  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get User's Orders
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('hotel', 'name image address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Orders (Admin only) or Restaurant Specific Orders
router.get("/", protect, restrictTo('admin', 'restaurant'), async (req, res) => {
  try {
    let filter = {};

    // --- QUERY FILTERS ---
    const { paymentMethod, status, refundStatus, date } = req.query;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;
    if (refundStatus) filter.refundStatus = refundStatus;
    // Optional date filter
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    if (req.user.role === 'restaurant') {
      // Find hotel for this user
      const Hotel = require('../models/Hotel');
      const hotel = await Hotel.findOne({ user: req.user._id });
      if (!hotel) {
        // Try fetching by email if user mapping is missing (legacy support)
        const hotelByEmail = await Hotel.findOne({ email: req.user.email });
        if (hotelByEmail) {
          filter.hotel = hotelByEmail._id;
        } else {
          return res.status(404).json({ message: "Hotel not found for this user" });
        }
      } else {
        filter.hotel = hotel._id;
      }
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Manage Refund Status (e.g., for COD or Manual Refunds)
router.put("/:id/refund-status", protect, restrictTo('admin'), async (req, res) => {
  try {
    const { refundStatus, note } = req.body; // e.g., 'COMPLETED', 'NOT_REQUIRED'

    // Validate status
    const allowed = ['NONE', 'PROCESSING', 'COMPLETED', 'NOT_REQUIRED'];
    if (!allowed.includes(refundStatus)) {
      return res.status(400).json({ message: "Invalid refund status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.refundStatus = refundStatus;

    // Logic: If Marked COMPLETED (Cash Refunded), update PaymentStatus too?
    if (refundStatus === 'COMPLETED') {
      order.paymentStatus = 'REFUNDED';
    }

    // Optional: Add note
    if (note) order.notes = (order.notes || "") + ` [Refund: ${note}]`;

    await order.save();
    res.json({ success: true, message: "Refund status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status
router.put("/:id/status", protect, restrictTo('admin', 'restaurant'), async (req, res) => {
  try {
    const { status } = req.body;

    // TODO: Verify if restaurant owns this order (Security enhancement)

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate Order
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a valid rating between 1 and 5" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow rating for delivered orders
    if (!['DELIVERED', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: "You can only rate orders that have been delivered" });
    }

    if (order.rating) {
      return res.status(400).json({ message: "This order has already been rated" });
    }

    order.rating = rating;
    order.feedback = feedback;
    order.ratedAt = new Date();

    await order.save();

    res.json({ success: true, message: "Thank you for your feedback!", order });
  } catch (err) {
    console.error("Rate order error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
