import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useCartStore } from '../store';

// Enhanced Mock Data with Images
const MOCK_FOODS = [
  {
    _id: '1',
    name: 'Supreme Pepperoni Pizza',
    description: 'Crispy edges with double pepperoni, mozzarella, and our signature tomato sauce.',
    price: 399,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop',
    rating: 4.5,
    available: true,
  },
  {
    _id: '2',
    name: 'Truffle Mushroom Burger',
    description: 'Juicy beef patty topped with swiss cheese, truffle mayo, and sautéed mushrooms.',
    price: 249,
    category: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
    available: true,
  },
  {
    _id: '3',
    name: 'Creamy Alfredo Pasta',
    description: 'Fettuccine pasta tossed in a rich parmesan and cream sauce with grilled chicken.',
    price: 299,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1626844131082-256783844137?q=80&w=1000&auto=format&fit=crop',
    rating: 4.3,
    available: true,
  },
  {
    _id: '4',
    name: 'Spicy Tandoori Wrap',
    description: 'Grilled tandoori chicken chunks wrapped in a soft naan with mint chutney.',
    price: 199,
    category: 'Wraps',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=1000&auto=format&fit=crop',
    rating: 4.6,
    available: true,
  },
  {
    _id: '5',
    name: 'Berry Blast Smoothie',
    description: 'A refreshing blend of strawberries, blueberries, raspberries, and yogurt.',
    price: 149,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1623592817342-fd829b5fb161?q=80&w=1000&auto=format&fit=crop',
    rating: 4.7,
    available: true,
  },
  {
    _id: '6',
    name: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cake with a molten center, served with vanilla ice cream.',
    price: 179,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000&auto=format&fit=crop',
    rating: 4.9,
    available: false,
  },
];

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Pasta', 'Wraps', 'Drinks', 'Desserts'];

export default function Home() {
  const { addItem } = useCartStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = MOCK_FOODS.filter((food) => {
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Best Food in Town
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-orange-600 to-slate-900 bg-clip-text text-transparent">
          Taste the Extraordinary
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Experience gourmet dining from the comfort of your home.
          Fresh ingredients, master chefs, and lightning-fast delivery.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="glass-morphism p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 ${activeCategory === category
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onAddToCart={() => addItem(food)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No items found</h3>
            <p className="text-slate-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
