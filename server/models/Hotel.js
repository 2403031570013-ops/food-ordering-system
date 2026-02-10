const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hotel/restaurant name'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: String, // Owner name for onboarding
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Restaurant',
    },
    bgImage: {
      type: String,
      default: 'https://via.placeholder.com/1200x400?text=Restaurant+Banner',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    openTime: {
      type: String, // HH:MM format
      default: '10:00',
    },
    closeTime: {
      type: String, // HH:MM format
      default: '23:00',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    cuisine: [String], // e.g., ['Indian', 'North Indian', 'Fast Food']
    deliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
    minimumOrder: {
      type: Number, // minimum order amount in rupees
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    discounts: [
      {
        code: String,
        percentage: Number,
        validUntil: Date,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed', 'pending', 'rejected', 'active'],
      default: 'pending',
    },
    // Onboarding specific fields
    approved: {
      type: Boolean,
      default: false,
    },
    fssaiLicense: String,
    gstNumber: String,
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    menuStatus: {
      type: String,
      enum: ['PENDING_SETUP', 'IN_PROGRESS', 'ACTIVE', 'REJECTED'],
      default: 'PENDING_SETUP',
    },
    menuLink: {
      type: String, // URL to menu file (PDF, Image, Excel)
    },
    menuText: {
      type: String, // Text description of menu items
    },
    adminNotes: {
      type: String, // Internal notes for admin
    },
  },
  { timestamps: true }
);

// Create geospatial index
hotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
