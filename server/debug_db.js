const mongoose = require('mongoose');
require('dotenv').config();
const Hotel = require('./models/Hotel');
const User = require('./models/User');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const hotelCount = await Hotel.countDocuments();
        console.log(`Total Hotels: ${hotelCount}`);

        const approvedHotels = await Hotel.countDocuments({ approved: true });
        console.log(`Approved Hotels: ${approvedHotels}`);

        const users = await User.countDocuments();
        console.log(`Total Users: ${users}`);

        const demoAdmin = await User.findOne({ email: 'demo@foodhub.com' });
        console.log(`Demo Admin exists: ${!!demoAdmin}`);

        const allHotels = await Hotel.find().select('name approved status email');
        console.log("All Hotels:", JSON.stringify(allHotels, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDB();
