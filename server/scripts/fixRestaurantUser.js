const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const fixPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'restaurant@foodhub.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('Found user.');
            // Set PLAIN TEXT password. 
            // The pre('save') hook in User.js will hash it.
            user.password = 'restaurant123';
            await user.save();
            console.log('✅ Password updated to "restaurant123" (plain text passed to save).');
        } else {
            console.log('❌ User not found.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

fixPassword();
