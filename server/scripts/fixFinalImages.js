const mongoose = require('mongoose');
const Food = require('../models/Food');

// Force URI
const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

const imageUpdates = {
    // Spice Villa
    "Tandoori Roti": "https://images.unsplash.com/photo-1626202187659-197e93ad3a8b?w=800&q=80",

    // Bombay Biryani House
    "Gulab Jamun": "https://images.unsplash.com/photo-1593701461250-d711fccd6d3b?w=800&q=80",
    "Lassi": "https://images.unsplash.com/photo-1543362906-ac1b16c6756c?w=800&q=80",

    // Dragon Bowl
    "Veg Steamed Momos": "https://plus.unsplash.com/premium_photo-1661600857317-j737488392104?w=800&q=80", // Using high quality fallback
    "Manchow Soup": "https://images.unsplash.com/photo-1547592166-23acbe3226bf?w=800&q=80",
    "Spring Rolls": "https://images.unsplash.com/photo-1544025162-d76690b67f66?w=800&q=80",
    "Hakka Noodles": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
    "Chicken Schezwan Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
    "Chilli Chicken": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80"
};

async function fixFinalImages() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        for (const [name, imageUrl] of Object.entries(imageUpdates)) {
            // Update using regex for loose matching and case insensitivity
            const result = await Food.updateMany(
                { name: { $regex: new RegExp(name, 'i') } },
                { $set: { image: imageUrl } }
            );
            console.log(`Updated ${name}: ${result.modifiedCount} items`);
        }

        console.log("✅ Final image fix applied.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixFinalImages();
