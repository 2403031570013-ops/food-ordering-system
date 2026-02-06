const mongoose = require('mongoose');
require('dotenv').config();
const Hotel = require('./models/Hotel');
const Food = require('./models/Food');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { demoMenus, demoRestaurants } = require('./seed/demoData');

async function resetDemo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // CLEANUP
        console.log("Cleaning up logic...");
        await Hotel.deleteMany({});
        await Food.deleteMany({});
        console.log("Database cleared (Hotels & Foods).");

        // CREATE ADMIN
        let demoUser = await User.findOne({ email: 'demo@foodhub.com' });
        if (!demoUser) {
            const hashedPassword = await bcrypt.hash('demo123', 10);
            demoUser = await User.create({
                name: "Demo Admin",
                email: "demo@foodhub.com",
                password: hashedPassword,
                role: "admin"
            });
            console.log("Created demo admin user.");
        } else {
            if (demoUser.role !== 'admin') {
                demoUser.role = 'admin';
                await demoUser.save();
            }
        }

        // CREATE RESTAURANT OWNER
        let ownerUser = await User.findOne({ email: 'owner@foodhub.com' });
        if (!ownerUser) {
            const hashedPassword = await bcrypt.hash('owner123', 10);
            ownerUser = await User.create({
                name: "Restaurant Owner",
                email: "owner@foodhub.com",
                password: hashedPassword,
                role: "restaurant", // Explicit role
                phone: "9876543210"
            });
            console.log("Created demo restaurant owner.");
        } else {
            if (ownerUser.role !== 'restaurant') {
                ownerUser.role = 'restaurant';
                await ownerUser.save();
            }
        }

        // SEED HOTELS
        for (const resData of demoRestaurants) {
            const hotel = await Hotel.create({
                ...resData,
                user: ownerUser._id, // Assign to Owner User
                email: `contact@${resData.name.replace(/\s+/g, '').toLowerCase()}.com`,
                phone: "9876543210"
            });
            console.log(`Created restaurant: ${hotel.name}`);

            const menu = demoMenus[hotel.name];
            if (menu) {
                const foodItems = menu.map(item => ({
                    ...item,
                    vegetarian: item.isVeg,
                    hotelId: hotel._id,
                    hotel: hotel._id
                }));
                await Food.insertMany(foodItems);
                console.log(`  Added ${foodItems.length} menu items.`);
            }
        }

        console.log("✅ RESET COMPLETE. Demo data restored.");
        process.exit(0);

    } catch (e) {
        console.error("RESET ERROR details:", JSON.stringify(e, null, 2));
        console.error(e);
        process.exit(1);
    }
}

resetDemo();
