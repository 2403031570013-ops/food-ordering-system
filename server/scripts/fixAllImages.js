const mongoose = require('mongoose');
const Food = require('../models/Food');
const Hotel = require('../models/Hotel');

// Force URI
const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

const imageUpdates = {
    // Midnight Munchies
    "Crispy Veggie Burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&q=80",
    "Cheesy Fries": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80",
    "gola ice": "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=80", // Ice cream/Dessert

    // Spice Villa
    "Tandoori Roti": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&q=80",

    // Dragon Bowl (Pre-emptive)
    "Veg Steamed Momos": "https://images.unsplash.com/photo-1626015495673-30332565caa1?w=800&q=80",
    "Spring Rolls": "https://images.unsplash.com/photo-1544025162-d76690b67f66?w=800&q=80",

    // Bombay Biryani House (Pre-emptive)
    "Gulab Jamun": "https://images.unsplash.com/photo-1593701461250-d711fccd6d3b?w=800&q=80"
};

async function fixAllImages() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Loop through mapped updates and apply them
        for (const [name, imageUrl] of Object.entries(imageUpdates)) {
            const result = await Food.updateMany(
                { name: { $regex: new RegExp(name, 'i') } }, // Case insensitive match
                { $set: { image: imageUrl } }
            );

            if (result.matchedCount > 0) {
                console.log(`Updated image for: "${name}" (${result.modifiedCount} items)`);
            } else {
                console.log(`Item not found: "${name}"`);
            }
        }

        // 2. Fallback: Find ANY item with missing image and give it a placeholder
        const missingImages = await Food.find({
            $or: [
                { image: { $exists: false } },
                { image: "" },
                { image: null },
                { image: "NO IMAGE" }
            ]
        });

        if (missingImages.length > 0) {
            console.log(`Found ${missingImages.length} items with absolutely NO image data. Fixing...`);
            for (const item of missingImages) {
                let fallback = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"; // Generic Food

                if (item.category === 'Dessert') fallback = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80";
                if (item.category === 'Drinks') fallback = "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80";

                item.image = fallback;
                await item.save();
                console.log(` -> Fixed missing image for ${item.name}`);
            }
        }

        console.log("✅ All images updated.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixAllImages();
