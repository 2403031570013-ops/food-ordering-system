// Quick script to create an admin user
// Run this once: node server/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@foodhub.com',
            password: 'admin123', // Change this to a secure password
            role: 'admin',
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('❌ Admin user already exists with this email');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = new User(adminData);
        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password: admin123 (CHANGE THIS!)');
        console.log('🎯 Role: admin');
        console.log('\n📌 You can now login at: http://localhost:5173/login');
        console.log('📌 Access admin dashboard at: http://localhost:5173/admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
