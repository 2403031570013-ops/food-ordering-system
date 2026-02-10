const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Food = require('../models/Food');
const User = require('../models/User');

// Force URI for script execution
const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

const demoMenu = [
    { name: "Dal Makhani", price: 180, description: "Rich and creamy black lentils slow-cooked overnight", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", category: "Curry", vegetarian: true, available: true },
    { name: "Butter Naan", price: 45, description: "Soft indian bread with butter", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80", category: "Breads", vegetarian: true, available: true },
    { name: "Paneer Butter Masala", price: 240, description: "Cottage cheese in rich tomato gravy", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80", category: "Curry", vegetarian: true, available: true },
    { name: "Chicken Tikka", price: 280, description: "Tandoori grilled chicken chunks", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80", category: "Starters", vegetarian: false, available: true },
    { name: "Jeera Rice", price: 120, description: "Basmati rice tempered with cumin seeds", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80", category: "Rice", vegetarian: true, available: true },
    { name: "Tandoori Roti", price: 30, description: "Whole wheat bread baked in clay oven", image: "https://images.unsplash.com/photo-1626202187659-197e93ad3a8b?w=800&q=80", category: "Breads", vegetarian: true, available: true }
];

async function fixSpiceVilla() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Find and Remove existing Spice Villa
        const existingHotel = await Hotel.findOne({ name: "Spice Villa" });
        if (existingHotel) {
            console.log(`Found existing Spice Villa (${existingHotel._id}). Deleting...`);
            // Delete hotel
            await Hotel.deleteOne({ _id: existingHotel._id });
            // Delete existing food items for this hotel
            const deleteResult = await Food.deleteMany({ hotelId: existingHotel._id });
            console.log(`Deleted old hotel and ${deleteResult.deletedCount} menu items.`);
        }

        // 2. Find Owner (Demo Admin)
        let demoUser = await User.findOne({ email: 'demo@foodhub.com' });
        if (!demoUser) {
            console.log("Demo user not found, using first admin...");
            demoUser = await User.findOne({ role: 'admin' });
        }

        if (!demoUser) {
            console.log("No admin found. Aborting.");
            process.exit(1);
        }

        // 3. Create New Spice Villa
        const newHotel = await Hotel.create({
            name: "Spice Villa",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
            cuisine: ["North Indian", "Tandoor"],
            rating: 4.7,
            deliveryTime: 45,
            address: { street: "101 Luxury Lane", city: "Delhi", state: "DL", pincode: "110001" },
            location: { type: 'Point', coordinates: [77.2090, 28.6139] },
            approved: true,
            status: "active",
            user: demoUser._id,
            email: "contact@spicevilla.com",
            phone: "9876543210",
            bgImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80",
            description: "Premium North Indian dining experience."
        });

        console.log(`Created NEW Spice Villa: ${newHotel._id}`);

        // 4. Add Menu Items
        const foodItems = demoMenu.map(item => ({
            ...item,
            hotelId: newHotel._id,
            hotel: newHotel._id, // Add this for redundancy
        }));

        const insertedFoods = await Food.insertMany(foodItems);
        console.log(`Added ${insertedFoods.length} menu items.`);

        // Link to hotel menu array
        newHotel.menu = insertedFoods.map(f => f._id);
        await newHotel.save();
        console.log("Linked menu to hotel.");

        console.log("DONE");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixSpiceVilla();
