import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store, User, Mail, Phone, MapPin, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../store';
import api from '../api';

export default function SelfOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        cuisine: [],
        description: '',
        fssaiLicense: '',
        gstNumber: '',
        password: '',
        confirmPassword: '',
    });

    const cuisineOptions = [
        'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai',
        'Continental', 'Fast Food', 'Desserts', 'Beverages'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCuisineToggle = (cuisine) => {
        setFormData(prev => ({
            ...prev,
            cuisine: prev.cuisine.includes(cuisine)
                ? prev.cuisine.filter(c => c !== cuisine)
                : [...prev.cuisine, cuisine]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            let response;
            if (user) {
                response = await api.post('/onboarding/restaurant/auth', formData);
            } else {
                response = await api.post('/onboarding/restaurant', formData);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-green-100/50 blur-3xl"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 max-w-md text-center z-10 border-green-200"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
                    <p className="text-slate-500 mb-6">
                        Thank you for your interest! Our team will review your application. Check your email for updates.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full inline-flex mx-auto">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Pending Admin Approval</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-6">Redirecting to login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 bg-slate-50 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
                        <Store className="w-5 h-5 text-orange-600" />
                        <span className="text-orange-600 font-bold uppercase tracking-wide text-xs">Partner Registration</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Grow with <span className="text-orange-600">FoodHub</span></h1>
                    <p className="text-xl text-slate-500">Join thousands of restaurants and reach new customers today.</p>
                </motion.div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div>
                        <h3 className="font-bold text-slate-900 mb-2">Quick Onboarding</h3>
                        <p className="text-sm text-slate-500">Get your restaurant live in just 2-3 business days.</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📈</div>
                        <h3 className="font-bold text-slate-900 mb-2">Boost Sales</h3>
                        <p className="text-sm text-slate-500">Reach a wider audience and increase your daily orders.</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💰</div>
                        <h3 className="font-bold text-slate-900 mb-2">Fair Commission</h3>
                        <p className="text-sm text-slate-500">Competitive rates with no hidden charges.</p>
                    </motion.div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism p-8 md:p-10 shadow-2xl bg-white/80"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Store className="w-5 h-5 text-orange-500" />
                                Restaurant Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">Restaurant Name *</label>
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        value={formData.restaurantName}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="e.g. The Spicy Kitchen"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">Owner Name *</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact & Location */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                Location & Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="business@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label-text">Full Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="input-field resize-none"
                                    placeholder="Shop No., Street, Area"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="label-text">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Cuisine */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                                <FileText className="w-5 h-5 text-orange-500" />
                                Menu & Description
                            </h2>
                            <div>
                                <label className="label-text mb-3 block">Cuisines Offered (multiselect) *</label>
                                <div className="flex flex-wrap gap-2">
                                    {cuisineOptions.map((cuisine) => (
                                        <button
                                            key={cuisine}
                                            type="button"
                                            onClick={() => handleCuisineToggle(cuisine)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.cuisine.includes(cuisine)
                                                ? 'bg-orange-600 text-white shadow-md transform scale-105'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label-text">Short Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="input-field resize-none"
                                    placeholder="Tell us what makes your food special..."
                                />
                            </div>
                        </div>

                        {/* Section 4: Password (if new user) */}
                        {!user && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <User className="w-5 h-5 text-orange-500" />
                                    Account Security
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label-text">Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!user}
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-text">Confirm Password *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required={!user}
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Legal (Optional) */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                                <FileText className="w-5 h-5 text-orange-500" />
                                Legal Details (Optional)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">FSSAI License</label>
                                    <input
                                        type="text"
                                        name="fssaiLicense"
                                        value={formData.fssaiLicense}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="License Number"
                                    />
                                </div>
                                <div>
                                    <label className="label-text">GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="GSTIN"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg shadow-xl shadow-orange-500/30"
                        >
                            {loading ? 'Submitting Application...' : 'Submit Application'}
                        </motion.button>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
