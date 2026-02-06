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
// @desc    Get all hotels/restaurants (including pending)
// @access  Private/Admin
router.get('/hotels', protect, admin, async (req, res) => {
    try {
        // Admin needs to see EVERYTHING: pending, active, rejected, closed
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
const { demoMenus } = require('../seed/demoData');

// @route   PUT /api/admin/hotels/:id/approve
// @desc    Approve/reject restaurant onboarding
// @access  Private/Admin
router.put('/hotels/:id/approve', protect, admin, async (req, res) => {
    try {
        // Force approval to true
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { approved: true, status: 'active' },
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Update User Role to 'restaurant' so they can access dashboard
        await User.findByIdAndUpdate(hotel.user, { role: 'restaurant' });

        // AUTO-SEED MENU IF EMPTY (Section 4 Requirement)
        const foodCount = await Food.countDocuments({ hotelId: hotel._id });
        if (foodCount === 0) {
            let menuToSeed = [];

            // Determine best menu based on cuisine
            const cuisine = (hotel.cuisine && hotel.cuisine.length > 0) ? hotel.cuisine[0] : 'Indian';

            if (cuisine.toLowerCase().includes('pizza') || cuisine.toLowerCase().includes('italian')) {
                menuToSeed = demoMenus["Pizza Palace"];
            } else if (cuisine.toLowerCase().includes('burger') || cuisine.toLowerCase().includes('american')) {
                menuToSeed = demoMenus["Burger Junction"];
            } else {
                // Default to Indian for now (covers "Indian", "North Indian", etc.)
                menuToSeed = demoMenus["Spice of India"];
            }

            if (menuToSeed && menuToSeed.length > 0) {
                const foodItems = menuToSeed.map(item => ({
                    ...item,
                    vegetarian: item.isVeg,
                    hotelId: hotel._id,
                    hotel: hotel._id
                }));
                await Food.insertMany(foodItems);
                console.log(`[AUTO-SEED] Generated default menu for ${hotel.name} (${foodItems.length} items)`);
            }
        }

        res.json(hotel);
    } catch (error) {
        console.error('Approve hotel error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/hotels/:id/reject
// @desc    Reject and delete restaurant application
// @access  Private/Admin
router.delete('/hotels/:id/reject', protect, admin, async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Also revert the user role? Or maybe just delete user too if it was purely for this?
        // For now, let's keep it simple.

        res.json({ message: 'Restaurant application rejected and deleted' });
    } catch (error) {
        console.error('Reject hotel error:', error);
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

// --- ANALYTICS ENDPOINTS ---

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics (Daily Revenue)
// @access  Private/Admin
router.get('/analytics/sales', protect, admin, async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            { $match: { status: 'delivered' } }, // Only consider delivered/paid orders
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }, // Sort by date ascending
            { $limit: 30 } // Last 30 days
        ]);
        res.json(salesData);
    } catch (error) {
        console.error('Sales analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/analytics/payments
// @desc    Get payment status breakdown
// @access  Private/Admin
router.get('/analytics/payments', protect, admin, async (req, res) => {
    try {
        const paymentStats = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);
        res.json(paymentStats);
    } catch (error) {
        console.error('Payment analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/analytics/top-restaurants
// @desc    Get top performing restaurants
// @access  Private/Admin
router.get('/analytics/top-restaurants', protect, admin, async (req, res) => {
    try {
        const topRest = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: "$hotel", // Group by Hotel ID
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "hotels", // Collection name (lowercase plural)
                    localField: "_id",
                    foreignField: "_id",
                    as: "hotelInfo"
                }
            },
            {
                $project: {
                    name: { $arrayElemAt: ["$hotelInfo.name", 0] },
                    revenue: 1,
                    orders: 1
                }
            }
        ]);
        res.json(topRest);
    } catch (error) {
        console.error('Restaurant analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
