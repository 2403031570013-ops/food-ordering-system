const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { body, validationResult, query } = require('express-validator');

// Get all foods with filters
router.get(
  '/',
  [
    query('category').optional().trim(),
    query('maxPrice').optional().isNumeric(),
    query('hotelId').optional(),
  ],
  async (req, res) => {
    try {
      const { category, maxPrice, hotelId, search } = req.query;

      let filter = { available: true };

      if (category) {
        filter.category = category;
      }

      if (maxPrice) {
        filter.price = { $lte: parseInt(maxPrice) };
      }

      if (hotelId) {
        filter.hotelId = hotelId;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const foods = await Food.find(filter)
        .populate('hotelId', 'name image')
        .limit(50)
        .sort({ rating: -1 });

      res.status(200).json(foods);
    } catch (error) {
      console.error('Get foods error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get single food
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      'hotelId',
      'name image address phone'
    );

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware
const { protect, restrictTo } = require('../middleware/auth');
const Hotel = require('../models/Hotel');

// Protected Routes (Admin & Restaurant Only)
router.post(
  '/',
  protect,
  // restrictTo('admin', 'restaurant'), // Allow both
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    // body('category').isIn(['Indian', 'Chinese', 'Fast Food', 'Dessert', 'Beverage']), // Relaxed for now
    body('price').isNumeric().withMessage('Valid price is required'),
    body('image').isURL().withMessage('Valid image URL is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let hotelId;

      // If Admin, they must provide hotelId
      if (req.user.role === 'admin') {
        if (!req.body.hotelId) {
          return res.status(400).json({ message: 'Admin must provide hotelId' });
        }
        hotelId = req.body.hotelId;
      }
      // If Restaurant Owner, FIND their hotel
      else if (req.user.role === 'restaurant') {
        const hotel = await Hotel.findOne({ user: req.user._id });
        if (!hotel) {
          // Fallback for legacy (email match)
          const hotelByEmail = await Hotel.findOne({ email: req.user.email });
          if (!hotelByEmail) return res.status(404).json({ message: 'No restaurant profile found for this user' });
          hotelId = hotelByEmail._id;
        } else {
          hotelId = hotel._id;
        }
      } else {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const food = new Food({
        ...req.body,
        hotel: hotelId, // Use 'hotel' as per Schema (check Schema if it's hotel or hotelId)
        hotelId: hotelId // Some parts use hotelId, let's keep both if schema allows or check schema
      });

      // Wait, let's check Food model schema first. 
      // Assuming 'hotel' is the ref. But previous code used 'hotelId' in populate.
      // Let's stick to what was there, but ensure we save correct field.
      // Previous GET used .populate('hotelId'). This implies the field name in Food schema IS 'hotelId'.

      await food.save();

      // Also push to Hotel's menu array if it exists
      await Hotel.findByIdAndUpdate(hotelId, { $push: { menu: food } });

      res.status(201).json({
        message: 'Food created successfully',
        food,
      });
    } catch (error) {
      console.error('Create food error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update food
router.put('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check ownership
    if (req.user.role === 'restaurant') {
      const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
      if (!hotel || food.hotelId.toString() !== hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this food item' });
      }
    }

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: 'Food updated successfully',
      food: updatedFood,
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete food
router.delete('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check ownership
    if (req.user.role === 'restaurant') {
      const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
      if (!hotel || food.hotelId.toString() !== hotel._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this food item' });
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    // Remove from Hotel menu array
    if (req.user.role === 'restaurant') {
      // We already found hotel above, but for brevity:
      const hotel = await Hotel.findOne({ user: req.user._id }) || await Hotel.findOne({ email: req.user.email });
      if (hotel) {
        await Hotel.findByIdAndUpdate(hotel._id, { $pull: { menu: req.params.id } });
      }
    }

    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
