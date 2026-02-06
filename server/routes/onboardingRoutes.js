const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @route   POST /api/onboarding/restaurant
// @desc    Restaurant self-onboarding
// @access  Public
const { protect } = require('../middleware/auth');

// @route   POST /api/onboarding/restaurant/auth
// @desc    Restaurant onboarding for logged-in users
// @access  Private
router.post(
    '/restaurant/auth',
    protect,
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

            // Ensure the logged-in user matches the email? 
            // Or just use the logged-in user.
            // Let's force using the logged-in user's email or ID.

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if restaurant with this email exists
            const existingHotel = await Hotel.findOne({ email });
            if (existingHotel) {
                return res.status(400).json({ message: 'Restaurant with this email already exists' });
            }

            // Update user role
            user.role = 'restaurant';
            user.firstLogin = false; // ensure this is set
            await user.save();

            // Create new hotel/restaurant linked to User
            const hotel = new Hotel({
                user: user._id, // Link to existing user
                name: restaurantName,
                owner: ownerName,
                email: user.email, // Use user's email
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
                approved: false,
                status: 'pending',
                rating: 0,
                reviews: 0,
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
            console.error('Auth restaurant onboarding error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// @route   POST /api/onboarding/restaurant
// @desc    Restaurant self-onboarding (Public)
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
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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
                password, // Added password
            } = req.body;

            // 1. Check if User or Hotel already exists
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists. Please login to apply.' });
            }

            const existingHotel = await Hotel.findOne({ email });
            if (existingHotel) {
                return res.status(400).json({ message: 'Restaurant with this email already exists' });
            }

            // 2. Create User (Restaurant Owner)
            const user = new User({
                name: ownerName,
                email,
                password,
                role: 'restaurant', // Set role to restaurant
            });
            await user.save();

            // 3. Create new hotel/restaurant linked to User
            const hotel = new Hotel({
                user: user._id, // Link to created user
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
                reviews: 0,
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
            console.error('Restaurant onboarding error details:', JSON.stringify(error, null, 2)); // Detailed log
            console.error('Restaurant onboarding error:', error);
            res.status(500).json({ message: 'Server error during registration', details: error.message });
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
