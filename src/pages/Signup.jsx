import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import api from '../api';
import { Mail, Lock, User, Eye, EyeOff, Store, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  // Step 1: selection, Step 2: form
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState('user'); // 'user' or 'restaurant'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain uppercase letter';
    if (!/\d/.test(formData.password)) newErrors.password = 'Password must contain number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // Default role is user. Restaurant registration is handled via Partner With Us flow.
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to create account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: ROLE SELECTION
  if (step === 1) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Join FoodHub Now</h1>
            <p className="text-slate-600">How would you like to use our platform?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* User Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 cursor-pointer hover:border-orange-500 transition-all group"
              onClick={() => setStep(2)}
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Food</h3>
              <p className="text-slate-500 mb-6">Create an account to browse menus and order from your favorite restaurants.</p>
              <span className="flex items-center text-orange-600 font-bold group-hover:translate-x-1 transition-transform">
                Join as Customer <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </motion.div>

            {/* Restaurant Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 cursor-pointer hover:border-blue-500 transition-all group"
              onClick={() => navigate('/partner-with-us')}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Partner with Us</h3>
              <p className="text-slate-500 mb-6">Register your restaurant, manage your menu, and reach new customers.</p>
              <span className="flex items-center text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                Join as Partner <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </motion.div>
          </div>

          <p className="text-center mt-10 text-slate-500">
            Already have an account? <Link to="/login" className="text-orange-600 font-bold hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // STEP 2: USER REGISTRATION FORM
  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => setStep(1)}
          className="absolute -top-10 left-0 text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1"
        >
          ← Back to Role Selection
        </button>

        <div className="glass-morphism rounded-3xl p-8 backdrop-blur-xl shadow-2xl border border-white/50 bg-white/70">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-500">Sign up to start ordering</p>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  required
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  required
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="password" // Simplification: didn't make separate show state for confirm, usually fine or user expects same
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-orange-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
