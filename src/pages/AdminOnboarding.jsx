import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store, User, Mail, Phone, MapPin, FileText, CheckCircle, Shield } from 'lucide-react';

export default function AdminOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        cuisine: [],
        description: '',
        fssaiLicense: '',
        gstNumber: '',
        subscriptionPlan: 'basic', // Admin can choose subscription
        status: 'approved', // Admin can approve directly
    });

    const cuisineOptions = [
        'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai',
        'Continental', 'Fast Food', 'Desserts', 'Beverages'
    ];

    const subscriptionPlans = [
        { value: 'basic', label: 'Basic - ₹999/month' },
        { value: 'premium', label: 'Premium - ₹1,999/month' },
        { value: 'enterprise', label: 'Enterprise - ₹4,999/month' }
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

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/admin/onboarding/restaurant`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-gradient-to-br from-green-50 to-green-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 max-w-md text-center"
                >
                    <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Restaurant Added Successfully!</h2>
                    <p className="text-slate-600 mb-6">
                        The restaurant has been onboarded and approved. They can now access their dashboard.
                    </p>
                    <p className="text-sm text-slate-500">Redirecting to admin panel...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-semibold">Admin Mode</span>
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-4">Add New Restaurant</h1>
                    <p className="text-xl text-slate-600">Onboard a restaurant partner directly</p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Store className="w-6 h-6" />
                                Restaurant Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Restaurant Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        value={formData.restaurantName}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Enter restaurant name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Owner Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Full name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Mail className="w-6 h-6" />
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="restaurant@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6" />
                                Location
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Full Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows={2}
                                        className="input-field"
                                        placeholder="Street address, landmark"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="input-field"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cuisine & Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                Restaurant Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Cuisine Type(s) *
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {cuisineOptions.map((cuisine) => (
                                            <button
                                                key={cuisine}
                                                type="button"
                                                onClick={() => handleCuisineToggle(cuisine)}
                                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${formData.cuisine.includes(cuisine)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {cuisine}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="input-field"
                                        placeholder="Tell us about the restaurant..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subscription Plan (Admin Specific) */}
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                Subscription Plan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {subscriptionPlans.map((plan) => (
                                    <label
                                        key={plan.value}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.subscriptionPlan === plan.value
                                            ? 'bg-blue-500 text-white border-blue-600'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="subscriptionPlan"
                                            value={plan.value}
                                            checked={formData.subscriptionPlan === plan.value}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="text-center font-bold">{plan.label}</div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Legal Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                Legal Information (Optional)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        FSSAI License Number
                                    </label>
                                    <input
                                        type="text"
                                        name="fssaiLicense"
                                        value={formData.fssaiLicense}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="14 digit license number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="15 digit GST number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Adding Restaurant...' : '✓ Add & Approve Restaurant'}
                        </motion.button>

                        <p className="text-sm text-center text-slate-500">
                            Restaurant will be approved and activated immediately
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
