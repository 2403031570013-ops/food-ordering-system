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
        image: String,
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
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'COD'],
      default: 'ONLINE',
    },
    paymentId: String, // Kept for backward compatibility
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'REFUNDED', 'FAILED', 'pending', 'paid', 'failed', 'refunded'],
      default: 'PENDING',
    },
    isDuplicatePayment: {
      type: Boolean,
      default: false,
    },
    refundId: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['NONE', 'PROCESSING', 'COMPLETED', 'NOT_REQUIRED'],
      default: 'NONE',
    },
    invoiceNumber: String,
    invoiceUrl: String,
    invoiceGeneratedAt: Date,
    taxPrice: { type: Number, default: 0 },
    subtotal: { type: Number },
    status: {
      type: String,
      enum: [
        'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
        'pending', 'accepted', 'rejected', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'
      ],
      default: 'PLACED',
    },
    cancellationReason: String,
    rejectionReason: {
      type: String,
    },
    acceptedAt: Date,
    rejectedAt: Date,
    couponCode: String,
    discountAmount: Number,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
