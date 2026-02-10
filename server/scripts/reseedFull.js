const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Food = require('../models/Food');
const User = require('../models/User');

// Force URI
const MONGO_URI = "mongodb+srv://2403031570013_db_user:fJ0Uj9rMexvzVMk7@cleartoday.50l6fba.mongodb.net/foodapp?retryWrites=true&w=majority";

const demoRestaurants = [
    {
        name: "Midnight Munchies",
        cuisine: ["Fast Food", "Burgers", "Beverages"],
        rating: 4.5,
        deliveryTime: 35,
        address: { street: "123 Night Owl St", city: "Delhi", state: "DL", pincode: "110001" },
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // CP, Delhi
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
        bgImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80",
        description: "Best late night cravings solution.",
        email: "contact@midnightmunchies.com",
        phone: "9876543210",
        menu: [
            { name: "Double Cheese Margherita", price: 199, description: "Classic cheese pizza with extra mozzarella", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80", category: "Pizza", vegetarian: true },
            { name: "BBQ Chicken Pizza", price: 249, description: "Smokey BBQ chicken with onions", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", category: "Pizza", vegetarian: false },
            { name: "Midnight Beast Burger", price: 149, description: "Double patty lamb burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", category: "Burger", vegetarian: false },
            { name: "Crispy Veggie Burger", price: 89, description: "Potato and pea patty with spicy mayo", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&q=80", category: "Burger", vegetarian: true },
            { name: "Cheesy Fries", price: 99, description: "Crispy fries topped with melted cheddar", image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80", category: "Sides", vegetarian: true },
            { name: "Oreo Shake", price: 110, description: "Thick creamy shake with oreo crumbles", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80", category: "Drinks", vegetarian: true }
        ]
    },
    {
        name: "Bombay Biryani House",
        cuisine: ["Biryani", "North Indian", "Mughlai"],
        rating: 4.8,
        deliveryTime: 40,
        address: { street: "45 Flavor Road", city: "Delhi", state: "DL", pincode: "110001" },
        location: { type: 'Point', coordinates: [77.2190, 28.6239] }, // Near CP
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80",
        bgImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1600&q=80",
        description: "Authentic dum biryani and kebabs.",
        email: "contact@bombaybiryani.com",
        phone: "9876543211",
        menu: [
            { name: "Chicken Dum Biryani", price: 180, description: "Authentic hyderabadi style dum biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", category: "Biryani", vegetarian: false },
            { name: "Paneer Tikka Biryani", price: 160, description: "Marinated paneer layered with aromatic rice", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80", category: "Biryani", vegetarian: true },
            { name: "Butter Chicken", price: 210, description: "Creamy tomato curry with tender chicken", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80", category: "Curry", vegetarian: false },
            { name: "Garlic Naan", price: 35, description: "Soft bread topped with garlic butter", image: "https://plus.unsplash.com/premium_photo-1661600857317-j737488392104?w=800&q=80", category: "Breads", vegetarian: true },
            { name: "Gulab Jamun", price: 60, description: "Soft dough balls dipped in sugar syrup", image: "https://images.unsplash.com/photo-1593701461250-d711fccd6d3b?w=800&q=80", category: "Dessert", vegetarian: true },
            { name: "Lassi", price: 50, description: "Sweet yogurt drink topped with malai", image: "https://images.unsplash.com/photo-1543362906-ac1b16c6756c?w=800&q=80", category: "Drinks", vegetarian: true }
        ]
    },
    {
        name: "Dragon Bowl",
        cuisine: ["Chinese", "Asian", "Thai"],
        rating: 4.4,
        deliveryTime: 30,
        address: { street: "88 Wok Way", city: "Delhi", state: "DL", pincode: "110001" },
        location: { type: 'Point', coordinates: [77.1990, 28.6039] }, // South Delhi-ish
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
        bgImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80",
        description: "Pan-Asian delicacies.",
        email: "contact@dragonbowl.com",
        phone: "9876543212",
        menu: [
            { name: "Hakka Noodles", price: 110, description: "Stir fried noodles with fresh veggies", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80", category: "Noodles", vegetarian: true },
            { name: "Chicken Schezwan Rice", price: 140, description: "Spicy fried rice with chicken chunks", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80", category: "Rice", vegetarian: false },
            { name: "Veg Steamed Momos", price: 80, description: "Delicate dumplings filled with veggies", image: "https://images.unsplash.com/photo-1626015495673-30332565caa1?w=800&q=80", category: "Momos", vegetarian: true },
            { name: "Chilli Chicken", price: 160, description: "Crispy chicken tossed in spicy soya sauce", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80", category: "Starters", vegetarian: false },
            { name: "Manchow Soup", price: 90, description: "Spicy soup topped with fried noodles", image: "https://images.unsplash.com/photo-1547592166-23acbe3226bf?w=800&q=80", category: "Soup", vegetarian: true },
            { name: "Spring Rolls", price: 100, description: "Crispy rolls with vegetable filling", image: "https://images.unsplash.com/photo-1544025162-d76690b67f66?w=800&q=80", category: "Starters", vegetarian: true }
        ]
    },
    {
        name: "Spice Villa",
        cuisine: ["North Indian", "Tandoor"],
        rating: 4.7,
        deliveryTime: 45,
        address: { street: "101 Luxury Lane", city: "Delhi", state: "DL", pincode: "110001" },
        location: { type: 'Point', coordinates: [77.2150, 28.6189] }, // Central Delhi
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        bgImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80",
        description: "Premium North Indian dining experience.",
        email: "contact@spicevilla.com",
        phone: "9876543213",
        menu: [
            { name: "Dal Makhani", price: 120, description: "Rich and creamy black lentils slow-cooked overnight", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", category: "Curry", vegetarian: true },
            { name: "Butter Naan", price: 30, description: "Soft indian bread with butter", image: "https://plus.unsplash.com/premium_photo-1661600857317-j737488392104?w=800&q=80", category: "Breads", vegetarian: true },
            { name: "Paneer Butter Masala", price: 150, description: "Cottage cheese in rich tomato gravy", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80", category: "Curry", vegetarian: true },
            { name: "Chicken Tikka", price: 170, description: "Tandoori grilled chicken chunks", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80", category: "Starters", vegetarian: false },
            { name: "Jeera Rice", price: 90, description: "Basmati rice tempered with cumin seeds", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80", category: "Rice", vegetarian: true },
            { name: "Tandoori Roti", price: 20, description: "Whole wheat bread baked in clay oven", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&q=80", category: "Breads", vegetarian: true }
        ]
    }
];

async function reseedFull() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for FULL RESEED...");

        // 1. Get User
        let user = await User.findOne({ email: 'demo@foodhub.com' });
        if (!user) {
            console.log("Creating default admin user...");
            // Password handling is complex without hashing util, assuming existence or manual creation.
            // We'll try to find ANY admin.
            user = await User.findOne({ role: 'admin' });
            if (!user) {
                console.error("No admin user found! Cannot link hotels. Aborting.");
                process.exit(1);
            }
        }
        console.log(`Using user: ${user.email} (${user._id})`);

        // 2. Clear Collections
        console.log("Clearing Hotels and Foods...");
        await Hotel.deleteMany({});
        await Food.deleteMany({});

        // 3. Insert Data
        let totalHotels = 0;
        let totalFoods = 0;

        for (const resData of demoRestaurants) {
            // Create Hotel
            const hotel = await Hotel.create({
                name: resData.name,
                cuisine: resData.cuisine,
                rating: resData.rating,
                deliveryTime: resData.deliveryTime,
                address: resData.address,
                location: resData.location,
                image: resData.image,
                bgImage: resData.bgImage,
                description: resData.description,
                email: resData.email,
                phone: resData.phone,
                user: user._id,
                approved: true,
                status: 'active',
                isOpen: true
            });
            console.log(`Created Hotel: ${hotel.name}`);
            totalHotels++;

            // Create Menu
            const foodItems = resData.menu.map(item => ({
                ...item,
                hotelId: hotel._id,
                hotel: hotel._id, // Redundancy check
                available: true,
                rating: 4.0,
                reviews: 0
            }));

            const createdFoods = await Food.insertMany(foodItems);
            console.log(`  -> Added ${createdFoods.length} items to menu.`);
            totalFoods += createdFoods.length;

            // Link to hotel
            hotel.menu = createdFoods.map(f => f._id);
            await hotel.save();
        }

        // 4. Ensure Index
        console.log("Ensuring Geospatial Index...");
        try {
            await Hotel.collection.createIndex({ location: "2dsphere" });
            console.log("Index created/verified.");
        } catch (err) {
            console.warn("Index creation warning (might exist):", err.message);
        }

        console.log(`\n✅ SUCCESSFULLY RESEEDED DB`);
        console.log(`Hotels: ${totalHotels}`);
        console.log(`Foods: ${totalFoods}`);

        process.exit(0);

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        process.exit(1);
    }
}

reseedFull();
