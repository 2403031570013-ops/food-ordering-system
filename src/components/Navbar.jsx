import { motion } from 'framer-motion';
import { ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 glass-morphism"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-white px-3 py-2 rounded-lg">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                  FoodHub
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-700 hover:text-orange-600 transition-colors">
              Home
            </Link>

            {/* Pricing - Premium Link */}
            <Link
              to="/pricing"
              className="text-slate-700 hover:text-orange-600 transition-colors font-medium flex items-center gap-1"
            >
              <span className="text-yellow-500">👑</span> Premium
            </Link>

            {/* Partner with Us - Always visible */}
            <Link
              to="/partner-with-us"
              className="text-slate-700 hover:text-orange-600 transition-colors font-medium"
            >
              🏪 Partner with Us
            </Link>

            {user && (
              <>
                <Link
                  to="/profile"
                  className="text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Orders
                </Link>

                {/* Admin Link - Only for admin users */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                  >
                    🎛️ Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <ShoppingCart className="w-6 h-6 text-slate-700 cursor-pointer" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Auth */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn-secondary">
                    Login
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-white/20"
          >
            <Link to="/" className="block py-2 text-slate-700 hover:text-orange-600">
              Home
            </Link>

            {/* Partner with Us - Mobile */}
            <Link
              to="/partner-with-us"
              className="block py-2 text-slate-700 hover:text-orange-600 font-medium"
            >
              🏪 Partner with Us
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-slate-700 hover:text-orange-600"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block py-2 text-slate-700 hover:text-orange-600"
                >
                  Orders
                </Link>

                {/* Admin Link - Mobile */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block py-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    🎛️ Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-500 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-orange-600 font-semibold">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
