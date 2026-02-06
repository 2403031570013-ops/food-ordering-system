const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@foodhub.com';
        const password = 'Admin@123';

        // Check if admin exits
        let adminUser = await User.findOne({ email });

        if (adminUser) {
            console.log('Admin user exists. Updating password...');
            // Directly set password; pre-save hook will hash it
            adminUser.password = password;
            adminUser.role = 'admin'; // Ensure role is admin
            await adminUser.save();
            console.log('✅ Admin credentials updated successfully.');
        } else {
            console.log('Admin user does not exist. Creating new admin...');
            adminUser = new User({
                name: 'FoodHub Admin',
                email: email,
                password: password,
                role: 'admin',
                firstLogin: false
            });
            await adminUser.save();
            console.log('✅ Admin account created successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
