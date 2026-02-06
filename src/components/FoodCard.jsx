import { motion } from 'framer-motion';
import { Star, ShoppingBasket, Ban } from 'lucide-react';
import SafeImage from './SafeImage';

export default function FoodCard({ food, onAddToCart, shopClosed }) {
  const isAvailable = food.available && !shopClosed;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          src={food.image}
          alt={food.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isAvailable ? 'grayscale' : ''}`}
        />

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transform -rotate-3">
              <Ban className="w-5 h-5 text-red-500" />
              {shopClosed ? 'CLOSED' : 'SOLD OUT'}
            </div>
          </div>
        )}

        {food.isVeg !== undefined && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`w-5 h-5 flex items-center justify-center border-2 ${food.isVeg ? 'border-green-600' : 'border-red-600'} bg-white rounded-sm`}>
              <span className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{food.name}</h3>
            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">
              <Star className="w-3 h-3 fill-green-700" />
              {food.rating || '4.0'}
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{food.category}</p>
        </div>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">
          {food.description}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium line-through">₹{Math.round(food.price * 1.2)}</span>
            <span className="text-xl font-bold text-slate-900">₹{food.price}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(food)}
            disabled={!isAvailable}
            className={`
              relative px-6 py-2 rounded-xl font-bold text-sm shadow-lg transition-all
              ${isAvailable
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/40'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            {isAvailable ? (
              <div className="flex items-center gap-2">
                ADD <ShoppingBasket className="w-4 h-4" />
              </div>
            ) : (
              'UNAVAILABLE'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
