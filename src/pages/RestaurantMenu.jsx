
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import api from '../api';
import FoodCard from '../components/FoodCard';
import { useCartStore } from '../store';
import SafeImage from '../components/SafeImage';

export default function RestaurantMenu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, items } = useCartStore();
    const [activeCategory, setActiveCategory] = useState('All');

    // Calculate cart total for floating bottom bar
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await api.get(`/hotels/${id}`);
                setRestaurant(response.data);
                setMenu(response.data.menu || []);
                setFilteredMenu(response.data.menu || []);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch restaurant', err);
                setError('Restaurant not found or server error');
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    useEffect(() => {
        if (!restaurant) return;

        let result = menu;

        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }

        setFilteredMenu(result);
    }, [searchQuery, activeCategory, menu, restaurant]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
        </div>
    );

    const categories = ['All', ...new Set(menu.map(item => item.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* IMMERSIVE HEADER */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <SafeImage
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-24 left-4 md:left-8 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all z-20"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Restaurant Info Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 text-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">{restaurant.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium opacity-90">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">{restaurant.cuisine.join(" • ")}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-orange-400" /> {restaurant.address?.city}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-orange-400" /> {restaurant.deliveryTime} mins</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl flex flex-col items-center shadow-xl">
                                        <div className="flex items-center gap-1 font-bold text-xl">
                                            <Star className="w-5 h-5 text-green-600 fill-green-600" />
                                            {restaurant.rating}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</span>
                                    </div>
                                    {!restaurant.isOpen && (
                                        <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl animate-pulse">
                                            CLOSED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-30">
                {/* Search & Categories Bar */}
                <div className="glass-morphism p-4 mb-8 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-2xl">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-slate-900 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-slate-600 hover:bg-orange-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pl-2 border-l-4 border-orange-500">
                    Menu <span className="text-base font-medium text-slate-400 ml-2">({filteredMenu.length} items)</span>
                </h2>

                {filteredMenu.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredMenu.map(food => (
                            <motion.div key={food._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <FoodCard
                                    food={food}
                                    onAddToCart={() => addItem(food)}
                                    shopClosed={!restaurant.isOpen}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-medium">No items match your search.</p>
                        <button onClick={() => { setSearchQuery(''); setActiveCategory('All') }} className="mt-4 text-orange-600 font-bold hover:underline">Clear Filters</button>
                    </div>
                )}
            </div>

            {/* Floating Cart Panel (Mobile/Desktop) */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="w-full max-w-lg bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between pointer-events-auto cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/cart')}>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cartCount} items added</span>
                                <span className="text-xl font-bold">₹{cartTotal} <span className="text-sm font-normal text-slate-400">plus taxes</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors">
                                View Cart <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
