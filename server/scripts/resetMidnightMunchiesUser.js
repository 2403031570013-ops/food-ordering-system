const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

const resetUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'restaurant@foodhub.com';
        const password = 'restaurant123';

        // 1. Find or Create User
        let user = await User.findOne({ email });
        if (user) {
            console.log('User found. Resetting password...');
            user.password = password;
            user.role = 'restaurant';
            await user.save();
        } else {
            console.log('User not found. Creating...');
            user = new User({
                name: 'Midnight Munchies Owner',
                email: email,
                password: password,
                role: 'restaurant'
            });
            await user.save();
        }

        // 2. Link to "Midnight Munchies" Hotel
        const hotelName = "Midnight Munchies"; // Or whatever the exact name is in your DB
        // Let's search for "Midnight Munchies" or similar
        let hotel = await Hotel.findOne({ name: { $regex: /Midnight Munchies/i } });

        if (hotel) {
            console.log(`Found hotel: ${hotel.name}. Linking to user...`);
            hotel.user = user._id;
            hotel.email = email; // Ensure email matches login
            hotel.owner = user.name;
            hotel.approved = true;
            hotel.status = 'active';
            await hotel.save();
            console.log('Hotel linked successfully.');
        } else {
            console.log('Warning: "Midnight Munchies" hotel not found in DB. Creating dummy one...');
            hotel = new Hotel({
                name: "Midnight Munchies",
                user: user._id,
                email: email,
                phone: "9998887776",
                address: {
                    street: "123 Night Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001"
                },
                cuisine: ["Fast Food", "Chinese"],
                approved: true,
                status: 'active'
            });
            await hotel.save();
            console.log('Created dummy "Midnight Munchies" hotel.');
        }

        console.log('✅ Midnight Munchies credentials reset successfully.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

resetUser();
