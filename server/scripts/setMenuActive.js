const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

async function setMenuActive() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected...");

        const result = await Hotel.updateMany({}, { $set: { menuStatus: 'ACTIVE' } });
        console.log(`Updated ${result.modifiedCount} hotels to ACTIVE menu status.`);

        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

setMenuActive();
