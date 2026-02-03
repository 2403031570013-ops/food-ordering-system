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

// Admin: Create food
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['Indian', 'Chinese', 'Fast Food', 'Dessert', 'Beverage']),
    body('price').isNumeric().withMessage('Valid price is required'),
    body('image').isURL().withMessage('Valid image URL is required'),
    body('hotelId').notEmpty().withMessage('Hotel ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const food = new Food(req.body);
      await food.save();

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

// Admin: Update food
router.put('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({
      message: 'Food updated successfully',
      food,
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete food
router.delete('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
