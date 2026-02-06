import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, MapPin, ChefHat, Pizza, Coffee, ArrowRight } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import { useLocationStore } from '../store';
import api from '../api';

// Modern categories with icons
const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Pizza', icon: Pizza },
  { name: 'Burger', icon: ChefHat },
  { name: 'Chinese', icon: ChefHat }, // Helper icon
  { name: 'Indian', icon: ChefHat },
  { name: 'Desserts', icon: Coffee },
];

export default function Home() {
  const { userLocation, requestLocation, isLoadingLocation } = useLocationStore();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Fetch Restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        let url = '/hotels';
        const hasLocation = !!userLocation;

        if (hasLocation) {
          url += `?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radius=10`; // 10km radius
        }

        let response = await api.get(url);

        // Fallback: If nearby search yields nothing, fetch all (for demo purposes)
        if (hasLocation && response.data.length === 0) {
          response = await api.get('/hotels');
        }

        const activeHotels = response.data.filter(h => h.approved); // Only active
        setRestaurants(activeHotels);
        setFilteredRestaurants(activeHotels);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch restaurants', error);
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [userLocation]);

  // Filter Logic
  useEffect(() => {
    let result = restaurants;

    if (activeCategory !== 'All') {
      result = result.filter(r => r.cuisine.includes(activeCategory));
    }

    if (searchQuery) {
      result = result.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredRestaurants(result);
  }, [activeCategory, searchQuery, restaurants]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden bg-slate-50">

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0], rotate: [0, 10, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-32 -right-32 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 px-4 mb-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

          <div className="flex-1 text-center md:text-left pt-10 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Delicious food delivered in minutes</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
            >
              Satisfy Your <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Cravings</span> Today
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              Explore top-rated restaurants, browse diverse menus, and get fast delivery to your doorstep.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-lg mx-auto md:mx-0 group z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-xl border border-white/50">
                <Search className="w-6 h-6 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 'Pizza', 'Burger'..."
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
                />
                <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Location Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 font-medium"
            >
              <MapPin className="w-4 h-4 text-orange-500" />
              {isLoadingLocation ? 'Locating you...' : (userLocation ? 'Showing restaurants near you' : 'Showing all locations')}
            </motion.div>
          </div>

          {/* Hero Image / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative hidden md:block"
          >
            <div className="relative z-10 w-full h-[500px]">
              {/* Floating Elements would go here - for now using a placeholder layout */}
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
                className="absolute top-10 right-10 w-64 h-64 object-cover rounded-full shadow-2xl border-4 border-white animate-float"
                style={{ animationDelay: '0s' }}
              />
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                className="absolute bottom-10 left-10 w-56 h-56 object-cover rounded-full shadow-2xl border-4 border-white animate-float"
                style={{ animationDelay: '2s' }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col items-center justify-center p-4 text-center animate-pulse">
                <span className="text-3xl">🔥</span>
                <span className="font-bold text-slate-900 text-sm mt-1">Hot Deals</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap ${activeCategory === cat.name
                  ? 'bg-slate-900 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-600 hover:bg-orange-50'
                }`}
            >
              {activeCategory === cat.name && <Sparkles className="w-4 h-4 text-orange-400" />}
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* RESTAURANT GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {activeCategory === 'All' ? 'Popular Restaurants' : `${activeCategory} Places`}
          </h2>
          <div className="text-sm font-bold text-slate-500">{filteredRestaurants.length} results</div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100" />
            ))
          ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No restaurants found</h3>
              <p className="text-slate-500">Try changing your filters</p>
            </div>
          )}
        </motion.div>
      </section>

    </div>
  );
}
