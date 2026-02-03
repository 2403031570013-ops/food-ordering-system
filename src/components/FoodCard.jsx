import { motion } from 'framer-motion';
import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function FoodCard({ food, onAddToCart }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.95 }}
      className="food-card group"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {food.available ? (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Available
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{food.name}</h3>
            <p className="text-sm text-slate-600">{food.category}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(food.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">{food.rating}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{food.description}</p>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-orange-600">₹{food.price}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(food)}
            disabled={!food.available}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
