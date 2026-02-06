const Hotel = require('../models/Hotel');
const Food = require('../models/Food');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const demoRestaurants = [
    {
        name: "Midnight Munchies",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
        cuisine: ["Pizza", "Burgers"],
        rating: 4.8,
        deliveryTime: 40,
        address: { street: "123 Night Street", city: "Mumbai", state: "MH", pincode: "400001" },
        location: { type: 'Point', coordinates: [72.8258, 18.9750] },
        approved: true,
        status: "active",
        bgImage: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1600&q=80",
        description: "Late night cravings sorted with cheesy pizzas and juicy burgers."
    },
    {
        name: "Bombay Biryani House",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
        cuisine: ["Indian", "Biryani"],
        rating: 4.5,
        deliveryTime: 35,
        address: { street: "45 Dadar West", city: "Mumbai", state: "MH", pincode: "400028" },
        location: { type: 'Point', coordinates: [72.8426, 19.0213] },
        approved: true,
        status: "active",
        bgImage: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1600&q=80",
        description: "Authentic Dum Biryani cooked with traditional spices."
    },
    {
        name: "Dragon Bowl",
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80",
        cuisine: ["Chinese"],
        rating: 4.6,
        deliveryTime: 30,
        address: { street: "88 China Town", city: "Kolkata", state: "WB", pincode: "700046" },
        location: { type: 'Point', coordinates: [88.3639, 22.5726] },
        approved: true,
        status: "active",
        bgImage: "https://images.unsplash.com/photo-1541544744-37570a849b07?w=1600&q=80",
        description: "Authentic Chinese flavors in every bowl."
    }
];

const demoMenus = {
    "Midnight Munchies": [
        { name: "Double Cheese Margherita", price: 399, description: "Classic cheese pizza with extra mozzarella", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80", category: "Pizza", isVeg: true },
        { name: "BBQ Chicken Pizza", price: 499, description: "Smokey BBQ chicken with onions", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", category: "Pizza", isVeg: false },
        { name: "Midnight Beast Burger", price: 299, description: "Double patty lamb burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", category: "Burgers", isVeg: false },
        { name: "Crispy Veggie Burger", price: 199, description: "Potato and pea patty with spicy mayo", image: "https://images.unsplash.com/photo-1550547660-d9450f859451?w=800&q=80", category: "Burgers", isVeg: true },
        { name: "Cheesy Fries", price: 149, description: "Crispy fries topped with melted cheddar", image: "https://images.unsplash.com/photo-1573080496987-a199f8cd4054?w=800&q=80", category: "Sides", isVeg: true },
        { name: "Oreo Shake", price: 179, description: "Thick creamy shake with oreo crumbles", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80", category: "Drinks", isVeg: true }
    ],
    "Bombay Biryani House": [
        { name: "Chicken Dum Biryani", price: 350, description: "Authentic hyderabadi style dum biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", category: "Biryani", isVeg: false },
        { name: "Paneer Tikka Biryani", price: 320, description: "Marinated paneer layered with aromatic rice", image: "https://images.unsplash.com/photo-1642821373181-6962d7781129?w=800&q=80", category: "Biryani", isVeg: true },
        { name: "Butter Chicken", price: 420, description: "Creamy tomato curry with tender chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", category: "Curry", isVeg: false },
        { name: "Garlic Naan", price: 60, description: "Soft bread topped with garlic butter", image: "https://images.unsplash.com/photo-1626082927389-9b2f3a67733f?w=800&q=80", category: "Breads", isVeg: true },
        { name: "Gulab Jamun", price: 120, description: "Soft dough balls dipped in sugar syrup", image: "https://images.unsplash.com/photo-1541745537411-b8096dc29c4e?w=800&q=80", category: "Dessert", isVeg: true },
        { name: "Lassi", price: 100, description: "Sweet yogurt drink topped with malai", image: "https://images.unsplash.com/photo-1626082927389-9b2f3a67733f?w=800&q=80", category: "Drinks", isVeg: true }
    ],
    "Dragon Bowl": [
        { name: "Hakka Noodles", price: 210, description: "Stir fried noodles with fresh veggies", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80", category: "Noodles", isVeg: true },
        { name: "Chicken Schezwan Rice", price: 250, description: "Spicy fried rice with chicken chunks", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80", category: "Rice", isVeg: false },
        { name: "Veg Steamed Momos", price: 140, description: "Delicate dumplings filled with veggies", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80", category: "Momos", isVeg: true },
        { name: "Chilli Chicken", price: 290, description: "Crispy chicken tossed in spicy soya sauce", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80", category: "Starters", isVeg: false },
        { name: "Manchow Soup", price: 160, description: "Spicy soup topped with fried noodles", image: "https://images.unsplash.com/photo-1547592166-23acbe3226bf?w=800&q=80", category: "Soup", isVeg: true },
        { name: "Spring Rolls", price: 180, description: "Crispy rolls with vegetable filling", image: "https://images.unsplash.com/photo-1544025162-d76690b67f66?w=800&q=80", category: "Starters", isVeg: true }
    ]
};

async function seedDemoData() {
    try {
        console.log("Seeding process started...");
        // Check for Demo Admin
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
            console.log("Demo admin user exists.");
        }

        // Seeding Logic
        for (const resData of demoRestaurants) {
            const existing = await Hotel.findOne({ name: resData.name });
            if (existing) {
                console.log(`Restaurant ${resData.name} already exists.`);
                continue;
            }

            const hotel = await Hotel.create({
                ...resData,
                user: demoUser._id,
                email: `contact@${resData.name.replace(/\s+/g, '').toLowerCase()}.com`,
                phone: "9876543210"
            });
            console.log(`Created restaurant: ${hotel.name}`);

            const menu = demoMenus[hotel.name];
            if (menu) {
                const foodItems = menu.map(item => ({
                    ...item,
                    hotelId: hotel._id,
                    hotel: hotel._id,
                    vegetarian: item.isVeg // Map isVeg to vegetarian
                }));
                await Food.insertMany(foodItems);
                console.log(`  Added ${foodItems.length} menu items.`);
            }
        }
        console.log("✅ Demo data seeded successfully.");

    } catch (error) {
        console.error("Seeding error:", error);
    }
}

module.exports = { seedDemoData, demoMenus, demoRestaurants };
