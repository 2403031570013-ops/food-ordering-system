import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { formatPrice } from '../utils/helpers';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-20 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-slate-300 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
          <p className="text-slate-600 text-lg mb-8">Add delicious items to get started</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Your Order</h1>
          <p className="text-slate-600">{items.length} item(s) in cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  className="glass-card p-6 flex items-center gap-6"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{item.category}</p>
                    <p className="text-xl font-bold text-orange-600">{formatPrice(item.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Subtotal</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-morphism rounded-2xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 mb-6"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center pb-4 border-b border-white/20"
                >
                  <span className="text-slate-700">Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center pb-4 border-b border-white/20"
                >
                  <span className="text-slate-700">Delivery Fee</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center pb-4 border-b border-white/20"
                >
                  <span className="text-slate-700">Tax (5%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center text-lg font-bold"
                >
                  <span className="text-slate-900">Total</span>
                  <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </span>
                </motion.div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="btn-primary w-full mb-4"
              >
                Proceed to Checkout
              </motion.button>

              <p className="text-sm text-slate-600 text-center">
                Free delivery on orders above ₹200
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
