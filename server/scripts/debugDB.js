const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Food = require('../models/Food');

const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

async function checkStatus() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected...");

        const hotelCount = await Hotel.countDocuments();
        const foodCount = await Food.countDocuments();

        console.log(`Hotels: ${hotelCount}`);
        console.log(`Food Items: ${foodCount}`);

        if (hotelCount > 0) {
            const hotels = await Hotel.find({}, 'name isOpen status');
            console.log("Hotels found:", hotels);
        }

        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

checkStatus();
