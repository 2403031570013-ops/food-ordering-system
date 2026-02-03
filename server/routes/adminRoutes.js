const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Food = require('../models/Food');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/admin/onboarding/restaurant
// @desc    Admin directly onboards a restaurant (instant approval)
// @access  Private/Admin
router.post(
    '/onboarding/restaurant',
    protect,
    admin,
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
                subscriptionPlan,
            } = req.body;

            // Check if restaurant already exists
            const existingHotel = await Hotel.findOne({ email });
            if (existingHotel) {
                return res.status(400).json({ message: 'Restaurant with this email already exists' });
            }

            // Create new hotel/restaurant (admin approval = instant)
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
                approved: true, // Admin approval = instant
                status: 'active', // Active immediately
                subscriptionPlan: subscriptionPlan || 'basic',
                rating: 4.0,
                reviews: 0,
            });

            await hotel.save();

            res.status(201).json({
                message: 'Restaurant successfully onboarded and activated!',
                hotel: {
                    id: hotel._id,
                    name: hotel.name,
                    status: hotel.status,
                    approved: hotel.approved,
                    subscriptionPlan: hotel.subscriptionPlan,
                },
            });

            console.log(`[ADMIN ONBOARDING] ${req.user.name} added restaurant: ${restaurantName}`);
        } catch (error) {
            console.error('Admin restaurant onboarding error:', error);
            res.status(500).json({ message: 'Server error during restaurant creation' });
        }
    }
);

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalHotels = await Hotel.countDocuments();
        const totalFoods = await Food.countDocuments();
        const totalOrders = await Order.countDocuments();

        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .populate('hotel', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            stats: {
                totalUsers,
                totalHotels,
                totalFoods,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
            },
            recentOrders,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/hotels
// @desc    Get all hotels/restaurants
// @access  Private/Admin
router.get('/hotels', protect, admin, async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ createdAt: -1 });
        res.json(hotels);
    } catch (error) {
        console.error('Get hotels error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/hotels/:id/approve
// @desc    Approve/reject restaurant onboarding
// @access  Private/Admin
router.put('/hotels/:id/approve', protect, admin, async (req, res) => {
    try {
        const { approved } = req.body;
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { approved, status: approved ? 'active' : 'rejected' },
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json(hotel);
    } catch (error) {
        console.error('Approve hotel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('hotel', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
