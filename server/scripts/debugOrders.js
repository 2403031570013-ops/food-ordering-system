const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

const debugOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Get current Restaurant User & Hotel
        const email = 'restaurant@foodhub.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ Restaurant user not found');
            return;
        }
        console.log(`User ID: ${user._id}`);

        const hotel = await Hotel.findOne({ user: user._id });
        if (!hotel) {
            console.log('❌ Hotel not found for this user');
            // Try finding by name to see if linkage is broken
            const hotelByName = await Hotel.findOne({ name: 'Midnight Munchies' });
            if (hotelByName) {
                console.log(`⚠️  Found "Midnight Munchies" by name (ID: ${hotelByName._id}), but it is linked to user: ${hotelByName.user}`);
            }
            return;
        }
        console.log(`✅ Current Hotel: "${hotel.name}" (ID: ${hotel._id})`);

        // 2. Find ALL Orders
        const allOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log('\n--- Recent Orders in DB ---');
        if (allOrders.length === 0) {
            console.log('No orders found in the database.');
        } else {
            allOrders.forEach(o => {
                const isMatch = o.hotel.toString() === hotel._id.toString();
                console.log(`Order ${o._id}:`);
                console.log(`  - Status: ${o.status}`);
                console.log(`  - Hotel ID: ${o.hotel} ${isMatch ? '✅ MATCHES' : '❌ MISMATCH'}`);
                console.log(`  - Created: ${o.createdAt}`);
            });
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debugOrders();
