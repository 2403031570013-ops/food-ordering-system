const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

const createRestaurantUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'restaurant@foodhub.com';
        const password = 'restaurant123';
        const restaurantName = 'Midnight Munchies';

        // 1. Create or Find User
        let user = await User.findOne({ email });
        if (!user) {
            console.log('Creating new restaurant user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                name: 'Restaurant Owner',
                email,
                password: hashedPassword,
                role: 'restaurant',
                firstLogin: false
            });
            console.log(`User created: ${email}`);
        } else {
            console.log(`User already exists: ${email}`);
            // Ensure role is restaurant
            if (user.role !== 'restaurant') {
                user.role = 'restaurant';
                await user.save();
                console.log('User role updated to restaurant.');
            }
        }

        // 2. Assign Restaurant to User
        const hotel = await Hotel.findOne({ name: restaurantName });
        if (!hotel) {
            console.error(`Restaurant "${restaurantName}" not found! Please seed data first.`);
            process.exit(1);
        }

        hotel.user = user._id;
        hotel.email = email; // Update contact email too
        await hotel.save();

        console.log(`SUCCESS! Assigned "${restaurantName}" to user "${email}".`);
        console.log('------------------------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createRestaurantUser();
