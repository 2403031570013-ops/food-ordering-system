const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    deliveryAddress: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: String, // Kept for backward compatibility, but use razorpayPaymentId
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    isDuplicatePayment: {
      type: Boolean,
      default: false,
    },
    refundId: String,
    refundAmount: Number,
    refundStatus: String,
    invoiceNumber: String,
    invoiceUrl: String,
    invoiceGeneratedAt: Date,
    taxPrice: { type: Number, default: 0 },
    subtotal: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    acceptedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
