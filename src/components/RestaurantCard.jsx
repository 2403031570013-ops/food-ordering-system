import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Bike, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';

export default function RestaurantCard({ restaurant }) {
    return (
        <Link to={`/restaurant/${restaurant._id}`}>
            <motion.div
                whileHover={{ y: -8 }}
                className="glass-card group h-full flex flex-col relative overflow-hidden"
            >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <SafeImage
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {restaurant.discounts && restaurant.discounts.length > 0 && (
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                <Percent className="w-3 h-3" />
                                {restaurant.discounts[0].percentage}% OFF
                            </span>
                        )}
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Bike className="w-3 h-3 text-orange-500" />
                            {restaurant.deliveryTime} mins
                        </span>
                    </div>

                    {!restaurant.isOpen && (
                        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-2xl border-2 border-white transform -rotate-6"
                            >
                                CLOSED NOW
                            </motion.div>
                        </div>
                    )}

                    {/* Rating (Bottom Right) */}
                    <div className="absolute bottom-3 right-3 z-20 bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-slate-800">{restaurant.rating || "NEW"}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col relative">
                    {/* Gradient Border Top */}
                    <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    <div className="mb-1">
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {restaurant.name}
                        </h3>
                    </div>

                    <p className="text-slate-500 text-sm mb-4 line-clamp-1 font-medium">
                        {restaurant.cuisine.join(" • ")}
                    </p>

                    <div className="mt-auto flex items-center justify-between text-slate-500 text-xs font-medium pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                            <span className="line-clamp-1 max-w-[140px]">{restaurant.address?.city || 'Nearby'}</span>
                        </div>
                        <span className="text-slate-400">
                            {restaurant.minimumOrder > 0 ? `Min ₹${restaurant.minimumOrder}` : 'No minimum'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
