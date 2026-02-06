const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { body, validationResult, query } = require('express-validator');

// Get all hotels with optional location filter
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    let query = Hotel.find({ approved: true });

    // If location coordinates provided, find nearby hotels
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInMeters = radius ? parseInt(radius) * 1000 : 5000; // Default 5km

      query = Hotel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusInMeters,
          },
        },
      });
    }

    const hotels = await query.limit(50);

    res.status(200).json(hotels);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single hotel with menu
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Get hotel's food items
    const Food = require('../models/Food');
    const foods = await Food.find({ hotelId: hotel._id });

    res.status(200).json({
      ...hotel.toObject(),
      menu: foods,
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const { protect } = require('../middleware/auth');

// Restaurant Owner: Get My Profile
router.get('/profile/me', protect, async (req, res) => {
  try {
    let hotel = await Hotel.findOne({ user: req.user._id });
    if (!hotel) {
      hotel = await Hotel.findOne({ email: req.user.email });
    }

    if (!hotel) {
      return res.status(404).json({ message: 'Restaurant profile not found' });
    }

    res.json(hotel);
  } catch (error) {
    console.error('My hotel profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restaurant Owner: Toggle Open/Close Status
router.put('/profile/toggle-status', protect, async (req, res) => {
  try {
    // Find hotel owned by this user
    // Note: In onboardingRoutes, we used email to link, but updated schema has 'user' field. 
    // We should try to find by user ID first, fallback to email if legacy.

    let hotel = await Hotel.findOne({ user: req.user._id });

    if (!hotel) {
      // Fallback to email for legacy data if any
      hotel = await Hotel.findOne({ email: req.user.email });
    }

    if (!hotel) {
      return res.status(404).json({ message: 'Restaurant profile not found for this user' });
    }

    // Toggle status
    hotel.isOpen = !hotel.isOpen;
    await hotel.save();

    res.json({
      success: true,
      message: `Restaurant is now ${hotel.isOpen ? 'OPEN' : 'CLOSED'}`,
      isOpen: hotel.isOpen,
      hotel
    });

  } catch (error) {
    console.error('My hotel toggle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create hotel
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Hotel name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('image').isURL().withMessage('Valid image URL is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('location.coordinates').isArray({ min: 2, max: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const hotel = new Hotel({
        ...req.body,
        location: {
          type: 'Point',
          coordinates: req.body.location.coordinates,
        },
      });

      await hotel.save();

      res.status(201).json({
        message: 'Hotel created successfully',
        hotel,
      });
    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin: Update hotel
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.location && updateData.location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: updateData.location.coordinates,
      };
    }

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.status(200).json({
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete hotel
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Optional: Delete all foods associated with this hotel
    const Food = require('../models/Food');
    await Food.deleteMany({ hotelId: hotel._id });

    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
