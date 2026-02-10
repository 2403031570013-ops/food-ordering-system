const mongoose = require('mongoose');
const Food = require('../models/Food');

// Force URI
const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

const masterUpdate = [
    // --- Bombay Biryani House ---
    { name: "Chicken Dum Biryani", price: 180, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
    { name: "Paneer Tikka Biryani", price: 160, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80" },
    { name: "Butter Chicken", price: 210, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80" },
    { name: "Garlic Naan", price: 35, image: "https://plus.unsplash.com/premium_photo-1661600857317-j737488392104?w=800&q=80" },
    { name: "Gulab Jamun", price: 60, image: "https://images.unsplash.com/photo-1593701461250-d711fccd6d3b?w=800&q=80" },
    { name: "Lassi", price: 50, image: "https://images.unsplash.com/photo-1543362906-ac1b16c6756c?w=800&q=80" },

    // --- Dragon Bowl ---
    { name: "Hakka Noodles", price: 110, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
    { name: "Chicken Schezwan Rice", price: 140, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80" },
    { name: "Veg Steamed Momos", price: 80, image: "https://images.unsplash.com/photo-1626015495673-30332565caa1?w=800&q=80" },
    { name: "Chilli Chicken", price: 160, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80" },
    { name: "Manchow Soup", price: 90, image: "https://images.unsplash.com/photo-1547592166-23acbe3226bf?w=800&q=80" },
    { name: "Spring Rolls", price: 100, image: "https://images.unsplash.com/photo-1544025162-d76690b67f66?w=800&q=80" },

    // --- Spice Villa ---
    { name: "Dal Makhani", price: 120, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
    { name: "Butter Naan", price: 30, image: "https://plus.unsplash.com/premium_photo-1661600857317-j737488392104?w=800&q=80" },
    { name: "Paneer Butter Masala", price: 150, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
    { name: "Chicken Tikka", price: 170, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
    { name: "Jeera Rice", price: 90, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80" },
    { name: "Tandoori Roti", price: 20, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&q=80" },

    // --- Midnight Munchies ---
    { name: "Double Cheese Margherita", price: 199, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80" },
    { name: "BBQ Chicken Pizza", price: 249, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
    { name: "Midnight Beast Burger", price: 149, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { name: "Crispy Veggie Burger", price: 89, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&q=80" },
    { name: "Cheesy Fries", price: 99, image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80" },
    { name: "Oreo Shake", price: 110, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" }
];

async function runMasterFix() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Master Fix...");

        let totalUpdated = 0;

        for (const item of masterUpdate) {
            // Find by name (case insensitive)
            const result = await Food.updateMany(
                { name: { $regex: new RegExp(`^${item.name}$`, 'i') } },
                {
                    $set: {
                        price: item.price,
                        image: item.image,
                        // Ensure required fields are there
                        available: true
                    }
                }
            );

            if (result.matchedCount > 0) {
                console.log(`✅ Updated ${item.name} | Price: ${item.price} | Image: OK`);
                totalUpdated += result.modifiedCount;
            } else {
                console.log(`⚠️ Item not found: ${item.name}`);
                // Optional: Insert if missing? For now, we assume they exist from demo seed
            }
        }

        console.log(`\n🎉 Total Items Updated: ${totalUpdated}`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

runMasterFix();
