const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


const { protect, restrictTo } = require("../middleware/auth");

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

module.exports = router;
