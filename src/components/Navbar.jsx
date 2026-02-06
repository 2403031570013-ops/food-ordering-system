import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, LogOut, Menu, X, ChevronDown, User, Store, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-morphism py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 transform group-hover:rotate-6">
                <span className="text-2xl">🍔</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">FoodHub</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Premium Delivery</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/pricing" current={location.pathname} icon="👑">Premium</NavLink>
              {!user && <NavLink to="/partner-with-us" current={location.pathname}>Partner</NavLink>}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-6">
              {/* Cart */}
              <Link to="/cart" className="relative group">
                <div className={`p-2 rounded-full transition-colors ${location.pathname === '/cart' ? 'bg-orange-100 text-orange-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-2"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>

                        <DropdownItem to="/profile" icon={User} onClick={() => setProfileOpen(false)}>My Profile</DropdownItem>
                        <DropdownItem to="/orders" icon={ShoppingCart} onClick={() => setProfileOpen(false)}>My Orders</DropdownItem>

                        {user.role === 'admin' && (
                          <DropdownItem to="/admin" icon={ShieldCheck} onClick={() => setProfileOpen(false)} className="text-blue-600 bg-blue-50/50">Admin Panel</DropdownItem>
                        )}
                        {user.role === 'restaurant' && (
                          <DropdownItem to="/restaurant/dashboard" icon={Store} onClick={() => setProfileOpen(false)} className="text-orange-600 bg-orange-50/50">Dashboard</DropdownItem>
                        )}

                        <div className="border-t border-slate-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-700" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 md:hidden overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <MobileLink to="/" onClick={() => setIsOpen(false)}>Home</MobileLink>
              <MobileLink to="/pricing" onClick={() => setIsOpen(false)}>Premium Plans</MobileLink>
              {!user && <MobileLink to="/partner-with-us" onClick={() => setIsOpen(false)}>Partner with Us</MobileLink>}

              <div className="border-t border-slate-100 my-2 pt-2"></div>

              {user ? (
                <>
                  <MobileLink to="/profile" onClick={() => setIsOpen(false)}>Profile</MobileLink>
                  <MobileLink to="/orders" onClick={() => setIsOpen(false)}>Orders</MobileLink>
                  {user.role === 'admin' && <MobileLink to="/admin" onClick={() => setIsOpen(false)} className="text-blue-600">Admin Dashboard</MobileLink>}
                  {user.role === 'restaurant' && <MobileLink to="/restaurant/dashboard" onClick={() => setIsOpen(false)} className="text-orange-600">Restaurant Dashboard</MobileLink>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 font-semibold rounded-xl hover:bg-red-50">Log Out</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="py-3 text-center font-bold text-slate-700 bg-slate-100 rounded-xl">Log In</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="py-3 text-center font-bold text-white bg-orange-600 rounded-xl">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, children, icon, current }) {
  const isActive = current === to;
  return (
    <Link
      to={to}
      className={`relative px-1 py-2 text-sm font-bold transition-colors ${isActive ? 'text-orange-600' : 'text-slate-600 hover:text-orange-600'}`}
    >
      <span className="flex items-center gap-1">{icon} {children}</span>
      {isActive && (
        <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
      )}
    </Link>
  );
}

function DropdownItem({ to, children, icon: Icon, onClick, className = '' }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-all ${className}`}
    >
      <Icon className="w-4 h-4 opacity-70" />
      {children}
    </Link>
  );
}

function MobileLink({ to, children, onClick, className = '' }) {
  return (
    <Link to={to} onClick={onClick} className={`block px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors ${className}`}>
      {children}
    </Link>
  )
}
