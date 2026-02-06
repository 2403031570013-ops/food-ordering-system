const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      required: [true, 'Please provide image URL'],
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
    available: {
      type: Boolean,
      default: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 30,
    },
    spicy: {
      type: String,
      enum: ['mild', 'medium', 'hot'],
      default: 'mild',
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    vegan: {
      type: Boolean,
      default: false,
    },
    nutrition: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);
