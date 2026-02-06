import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, User, Store, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import api from '../api';
import { validateEmail } from '../utils/helpers';
import { toast } from 'react-toastify';

const roles = [
  { id: 'user', label: 'User', icon: User, color: 'from-orange-400 to-red-500' },
  { id: 'restaurant', label: 'Restaurant', icon: Store, color: 'from-blue-400 to-indigo-500' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'from-emerald-400 to-teal-500' },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirects or messages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error')));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const activeRoleData = roles.find(r => r.id === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // We use the unified auth login, but we will ENFORCE role matching on the client
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;

      // STRICT ROLE CHECK
      if (user.role !== activeRole) {
        // Special case: Admin can typically log in anywhere, but let's be strict as requested.
        // Actually, let's allow "User" login on "User" tab.
        // If I am a Restaurant owner trying to login on User tab, maybe allow it?
        // The prompt says: "Wrong role access → redirect to login".
        // Let's enforce it strictly to satisfy the "Role-based login" requirement.

        const roleNames = { user: 'Customer', restaurant: 'Restaurant Partner', admin: 'Administrator' };
        throw new Error(`Access Denied. You are a ${roleNames[user.role]}, not a ${roleNames[activeRole]}. Please switch tabs.`);
      }

      setToken(token);
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect logic
      if (location.state?.from) {
        navigate(location.state.from);
      } else if (user.firstLogin) {
        navigate('/select-role');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      // Shake animation trigger could go here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      {/* Background Blobs - subtle & animated */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-morphism p-8 shadow-2xl border border-white/40 bg-white/60 backdrop-blur-xl rounded-3xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-inner mb-4">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-1">Please enter your details to sign in</p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8 relative">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 ${activeRole === role.id ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {activeRole === role.id && (
                  <motion.div
                    layoutId="activeRoleBg"
                    className={`absolute inset-0 rounded-lg bg-gradient-to-r ${role.color}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: 'auto', mb: 16 }}
                exit={{ opacity: 0, height: 0, mb: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${activeRole === 'admin' ? 'text-emerald-500' : activeRole === 'restaurant' ? 'text-blue-500' : 'text-orange-500'}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={activeRole === 'admin' ? "admin@foodhub.com" : "name@example.com"}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:bg-white focus:bg-white shadow-sm"
                  style={{
                    '--tw-ring-color': activeRole === 'admin' ? '#10b981' : activeRole === 'restaurant' ? '#3b82f6' : '#f97316'
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${activeRole === 'admin' ? 'text-emerald-500' : activeRole === 'restaurant' ? 'text-blue-500' : 'text-orange-500'}`} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:bg-white focus:bg-white shadow-sm"
                  style={{
                    '--tw-ring-color': activeRole === 'admin' ? '#10b981' : activeRole === 'restaurant' ? '#3b82f6' : '#f97316'
                  }}
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r ${activeRoleData.color}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer - Sign Up */}
          {activeRole !== 'admin' && (
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account yet?{' '}
                <Link to="/signup" className={`font-bold hover:underline transition-colors ${activeRole === 'restaurant' ? 'text-blue-600' : 'text-orange-600'}`}>
                  {activeRole === 'restaurant' ? 'Partner with us' : 'Create Account'}
                </Link>
              </p>
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure Admin Portal
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

