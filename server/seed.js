/**
 * Seed script to populate database with sample restaurants and food items
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Food = require('./models/Food');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Hotel.deleteMany({});
    await Food.deleteMany({});

    console.log('Cleared existing data');

    // Sample Hotels
    const hotels = await Hotel.insertMany([
      {
        name: 'Taj Hotel',
        description: 'Premium North Indian cuisine with authentic flavors',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipcode: '400001',
        },
        location: {
          type: 'Point',
          coordinates: [72.8479, 19.0176], // Mumbai
        },
        phone: '+91-9876543210',
        email: 'taj@example.com',
        openTime: '10:00',
        closeTime: '23:30',
        rating: 4.8,
        reviews: 1250,
        cuisine: ['Indian', 'North Indian', 'Mughlai'],
        deliveryTime: 30,
        minimumOrder: 200,
        deliveryFee: 40,
      },
      {
        name: 'Dragon Palace',
        description: 'Authentic Chinese cuisine with fresh ingredients',
        image: 'https://images.unsplash.com/photo-1563245372-f403bf289096?w=500&h=300&fit=crop',
        address: {
          street: '456 Park Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipcode: '400002',
        },
        location: {
          type: 'Point',
          coordinates: [72.8394, 19.0827], // Mumbai
        },
        phone: '+91-9876543211',
        email: 'dragon@example.com',
        openTime: '11:00',
        closeTime: '23:00',
        rating: 4.6,
        reviews: 980,
        cuisine: ['Chinese', 'Asian Fusion'],
        deliveryTime: 25,
        minimumOrder: 250,
        deliveryFee: 50,
      },
      {
        name: 'Burger King',
        description: 'Fast food favorites - burgers, fries, and more',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
        address: {
          street: '789 Speed Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipcode: '400003',
        },
        location: {
          type: 'Point',
          coordinates: [72.8295, 19.1033], // Mumbai
        },
        phone: '+91-9876543212',
        email: 'burgerking@example.com',
        openTime: '08:00',
        closeTime: '23:59',
        rating: 4.4,
        reviews: 2100,
        cuisine: ['Fast Food', 'Burgers', 'Fries'],
        deliveryTime: 20,
        minimumOrder: 150,
        deliveryFee: 30,
      },
      {
        name: 'Sweet Dreams Bakery',
        description: 'Freshly baked pastries, cakes, and desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=300&fit=crop',
        address: {
          street: '321 Sweet Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipcode: '400004',
        },
        location: {
          type: 'Point',
          coordinates: [72.8195, 19.0876], // Mumbai
        },
        phone: '+91-9876543213',
        email: 'sweetdreams@example.com',
        openTime: '09:00',
        closeTime: '22:00',
        rating: 4.7,
        reviews: 650,
        cuisine: ['Dessert', 'Bakery', 'Sweets'],
        deliveryTime: 15,
        minimumOrder: 100,
        deliveryFee: 25,
      },
    ]);

    console.log(`${hotels.length} hotels created`);

    // Sample Foods
    const foods = await Food.insertMany([
      // Taj Hotel Foods
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato and butter sauce',
        category: 'Indian',
        price: 320,
        image: 'https://images.unsplash.com/photo-1603479499028-b1d1d5e4ce6d?w=500&h=300&fit=crop',
        rating: 4.8,
        reviews: 340,
        available: true,
        hotelId: hotels[0]._id,
        preparationTime: 25,
        spicy: 'mild',
        vegetarian: false,
        vegan: false,
        nutrition: {
          calories: 380,
          protein: 28,
          fat: 22,
          carbs: 12,
        },
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese marinated in spices',
        category: 'Indian',
        price: 280,
        image: 'https://images.unsplash.com/photo-1559738902372-bfc7e84a5c9f?w=500&h=300&fit=crop',
        rating: 4.6,
        reviews: 215,
        available: true,
        hotelId: hotels[0]._id,
        preparationTime: 20,
        spicy: 'medium',
        vegetarian: true,
        vegan: false,
      },
      {
        name: 'Garlic Naan',
        description: 'Soft naan bread with garlic and herbs',
        category: 'Indian',
        price: 80,
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=300&fit=crop',
        rating: 4.7,
        reviews: 520,
        available: true,
        hotelId: hotels[0]._id,
        preparationTime: 10,
        spicy: 'mild',
        vegetarian: true,
        vegan: false,
      },

      // Dragon Palace Foods
      {
        name: 'Chow Mein',
        description: 'Stir-fried noodles with vegetables and soy sauce',
        category: 'Chinese',
        price: 220,
        image: 'https://images.unsplash.com/photo-1585521537505-bf6f79034eab?w=500&h=300&fit=crop',
        rating: 4.5,
        reviews: 180,
        available: true,
        hotelId: hotels[1]._id,
        preparationTime: 18,
        spicy: 'medium',
        vegetarian: false,
        vegan: false,
      },
      {
        name: 'Spring Rolls',
        description: 'Crispy spring rolls with sweet and sour sauce',
        category: 'Chinese',
        price: 150,
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b5?w=500&h=300&fit=crop',
        rating: 4.4,
        reviews: 290,
        available: true,
        hotelId: hotels[1]._id,
        preparationTime: 15,
        spicy: 'mild',
        vegetarian: false,
        vegan: false,
      },
      {
        name: 'Fried Rice',
        description: 'Fragrant fried rice with egg, vegetables, and soy sauce',
        category: 'Chinese',
        price: 200,
        image: 'https://images.unsplash.com/photo-1545389336-cf633d991ba7?w=500&h=300&fit=crop',
        rating: 4.6,
        reviews: 410,
        available: true,
        hotelId: hotels[1]._id,
        preparationTime: 16,
        spicy: 'medium',
        vegetarian: false,
        vegan: false,
      },

      // Burger King Foods
      {
        name: 'Whopper Burger',
        description: 'Flame-grilled beef patty with fresh vegetables',
        category: 'Fast Food',
        price: 180,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
        rating: 4.5,
        reviews: 1120,
        available: true,
        hotelId: hotels[2]._id,
        preparationTime: 10,
        spicy: 'mild',
        vegetarian: false,
        vegan: false,
      },
      {
        name: 'French Fries',
        description: 'Golden crispy fries seasoned perfectly',
        category: 'Fast Food',
        price: 80,
        image: 'https://images.unsplash.com/photo-1585238341710-4abb7c7f32e8?w=500&h=300&fit=crop',
        rating: 4.3,
        reviews: 890,
        available: true,
        hotelId: hotels[2]._id,
        preparationTime: 8,
        spicy: 'mild',
        vegetarian: true,
        vegan: true,
      },
      {
        name: 'Chicken Nuggets',
        description: 'Golden crispy chicken nuggets (6 pieces)',
        category: 'Fast Food',
        price: 120,
        image: 'https://images.unsplash.com/photo-1562547256-c5b0db84eb8c?w=500&h=300&fit=crop',
        rating: 4.4,
        reviews: 670,
        available: true,
        hotelId: hotels[2]._id,
        preparationTime: 12,
        spicy: 'mild',
        vegetarian: false,
        vegan: false,
      },

      // Sweet Dreams Bakery Foods
      {
        name: 'Chocolate Cake Slice',
        description: 'Rich chocolate cake with chocolate frosting',
        category: 'Dessert',
        price: 120,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=300&fit=crop',
        rating: 4.9,
        reviews: 450,
        available: true,
        hotelId: hotels[3]._id,
        preparationTime: 5,
        spicy: 'mild',
        vegetarian: true,
        vegan: false,
      },
      {
        name: 'Chocolate Croissant',
        description: 'Buttery croissant with melted chocolate inside',
        category: 'Dessert',
        price: 90,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db97?w=500&h=300&fit=crop',
        rating: 4.7,
        reviews: 320,
        available: true,
        hotelId: hotels[3]._id,
        preparationTime: 5,
        spicy: 'mild',
        vegetarian: true,
        vegan: false,
      },
      {
        name: 'Cheesecake',
        description: 'Creamy New York style cheesecake',
        category: 'Dessert',
        price: 150,
        image: 'https://images.unsplash.com/photo-1572695157366-5e585ab17b44?w=500&h=300&fit=crop',
        rating: 4.8,
        reviews: 380,
        available: true,
        hotelId: hotels[3]._id,
        preparationTime: 5,
        spicy: 'mild',
        vegetarian: true,
        vegan: false,
      },
    ]);

    console.log(`${foods.length} food items created`);
    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

connectDB();
seedData();
