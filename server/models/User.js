const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Debug Log
    // console.log("Initializing User Schema with minlength 6");
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      default: null,
    },
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        isDefault: Boolean,
      },
    ],
    role: {
      type: String,
      enum: ['user', 'restaurant', 'admin'],
      default: 'user',
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String, // Store Google ID
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'lite', 'pro'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    subscriptionExpiry: {
      type: Date,
    },
    razorpaySubscriptionId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
