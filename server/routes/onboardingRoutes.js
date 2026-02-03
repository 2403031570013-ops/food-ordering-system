const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { body, validationResult } = require('express-validator');

// @route   POST /api/onboarding/restaurant
// @desc    Restaurant self-onboarding
// @access  Public
router.post(
    '/restaurant',
    [
        body('restaurantName').trim().notEmpty().withMessage('Restaurant name is required'),
        body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('city').trim().notEmpty().withMessage('City is required'),
        body('cuisine').notEmpty().withMessage('Cuisine type is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                restaurantName,
                ownerName,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                cuisine,
                description,
                fssaiLicense,
                gstNumber,
            } = req.body;

            // Check if restaurant already exists
            const existingHotel = await Hotel.findOne({ email });
            if (existingHotel) {
                return res.status(400).json({ message: 'Restaurant with this email already exists' });
            }

            // Create new hotel/restaurant
            const hotel = new Hotel({
                name: restaurantName,
                owner: ownerName,
                email,
                phone,
                address: {
                    street: address,
                    city,
                    state: state || '',
                    pincode: pincode || '',
                },
                cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
                description: description || '',
                fssaiLicense: fssaiLicense || '',
                gstNumber: gstNumber || '',
                approved: false, // Admin approval required
                status: 'pending',
                rating: 0,
                reviews: [],
            });

            await hotel.save();

            res.status(201).json({
                message: 'Application submitted successfully! We will review and get back to you soon.',
                hotel: {
                    id: hotel._id,
                    name: hotel.name,
                    status: hotel.status,
                },
            });
        } catch (error) {
            console.error('Restaurant onboarding error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// @route   GET /api/onboarding/status/:email
// @desc    Check onboarding application status
// @access  Public
router.get('/status/:email', async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ email: req.params.email }).select('name status approved createdAt');

        if (!hotel) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            restaurant: hotel.name,
            status: hotel.status,
            approved: hotel.approved,
            appliedOn: hotel.createdAt,
        });
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
