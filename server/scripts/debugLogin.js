const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const debugLogin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'UNDEFINED');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'restaurant@foodhub.com';
        const password = 'restaurant123';

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User NOT FOUND in database.');
        } else {
            console.log('✅ User FOUND.');
            console.log(`ID: ${user._id}`);
            console.log(`HASH: ${user.password}`);

            console.log('Verifying password...');
            const isMatch = await user.comparePassword(password);
            if (isMatch) {
                console.log('✅ Password matches.');
            } else {
                console.log('❌ Password DOES NOT match.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugLogin();
