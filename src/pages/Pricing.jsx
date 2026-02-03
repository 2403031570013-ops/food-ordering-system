import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import axios from 'axios';
import {
    Check, X, Crown, Zap, Shield, Star, TrendingUp,
    Headphones, Gift, Sparkles
} from 'lucide-react';

export default function Pricing() {
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        if (user && token) {
            fetchCurrentSubscription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    const fetchCurrentSubscription = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/subscriptions/my-subscription`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentSubscription(response.data.subscription);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    const handleUpgrade = async (plan) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (plan === 'free') return;

        setLoading(true);
        setSelectedPlan(plan);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // Create order
            const orderResponse = await axios.post(
                `${API_URL}/api/subscriptions/upgrade`,
                { plan },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency,
                name: 'FoodHub Premium',
                description: `${orderResponse.data.planName} Subscription`,
                order_id: orderResponse.data.orderId,
                handler: async function (response) {
                    // Verify payment
                    try {
                        const verifyResponse = await axios.post(
                            `${API_URL}/api/subscriptions/verify-payment`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: plan,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        alert(`🎉 ${verifyResponse.data.message}`);
                        fetchCurrentSubscription();
                        setLoading(false);
                    } catch (error) {
                        alert('Payment verification failed!');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: '#f97316',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('Failed to initiate upgrade');
            setLoading(false);
        }
    };

    const getIconClasses = (color) => {
        const colorMap = {
            slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
        };
        return colorMap[color] || colorMap.slate;
    };

    const plans = [
        {
            id: 'free',
            name: 'FoodHub Free',
            price: 0,
            period: 'Forever',
            icon: Star,
            color: 'slate',
            popular: false,
            features: [
                { text: 'Basic food ordering', included: true },
                { text: '2 orders per month', included: true },
                { text: 'Standard delivery', included: true },
                { text: 'Email support', included: true },
                { text: 'Free delivery', included: false },
                { text: 'Cashback rewards', included: false },
                { text: 'Priority support', included: false },
            ],
        },
        {
            id: 'lite',
            name: 'FoodHub Lite',
            price: 99,
            period: 'month',
            icon: Zap,
            color: 'blue',
            popular: true,
            badge: 'Most Popular',
            features: [
                { text: 'Unlimited orders', included: true },
                { text: 'Free delivery on orders > ₹200', included: true },
                { text: '5% cashback on all orders', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Monthly exclusive offers', included: true },
                { text: 'Early access to new restaurants', included: true },
                { text: '24/7 phone support', included: false },
            ],
        },
        {
            id: 'pro',
            name: 'FoodHub Pro',
            price: 299,
            period: 'month',
            icon: Crown,
            color: 'orange',
            popular: false,
            badge: 'Best Value',
            features: [
                { text: 'Everything in Lite', included: true },
                { text: 'FREE delivery on ALL orders', included: true },
                { text: '15% cashback on all orders', included: true },
                { text: 'Priority 24/7 phone support', included: true },
                { text: 'Exclusive restaurant access', included: true },
                { text: 'Birthday & anniversary treats', included: true },
                { text: 'Dedicated account manager', included: true },
            ],
        },
    ];

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full mb-6"
                    >
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-semibold text-slate-700">Choose Your Perfect Plan</span>
                    </motion.div>

                    <h1 className="text-6xl font-bold text-slate-900 mb-4">
                        Simple, Transparent{' '}
                        <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Choose the plan that works best for you. Upgrade, downgrade, or cancel anytime.
                    </p>
                </motion.div>

                {/* Current Subscription Alert */}
                {currentSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                        <p className="text-center text-blue-800">
                            <strong>Current Plan:</strong> {currentSubscription.plan.toUpperCase()}
                            {currentSubscription.plan !== 'free' && ` (Valid until ${new Date(currentSubscription.endDate).toLocaleDateString()})`}
                        </p>
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = currentSubscription?.plan === plan.id;
                        const iconColors = getIconClasses(plan.color);

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative glass-card p-8 ${plan.popular
                                    ? 'ring-2 ring-blue-500 shadow-2xl transform md:-translate-y-4'
                                    : ''
                                    }`}
                            >
                                {/* Popular Badge */}
                                {plan.badge && (
                                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r ${plan.color === 'blue' ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
                                        } text-white text-sm font-bold rounded-full shadow-lg`}>
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${iconColors.bg} mb-4`}>
                                        <Icon className={`w-8 h-8 ${iconColors.text}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold text-slate-900">₹{plan.price}</span>
                                        <span className="text-slate-600">/{plan.period}</span>
                                    </div>
                                </div>

                                {/* Features List */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            {feature.included ? (
                                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <motion.button
                                    whileHover={{ scale: isCurrentPlan ? 1 : 1.02 }}
                                    whileTap={{ scale: isCurrentPlan ? 1 : 0.98 }}
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={loading || isCurrentPlan || plan.id === 'free'}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${isCurrentPlan
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : plan.id === 'free'
                                            ? 'bg-slate-100 text-slate-700 cursor-default'
                                            : plan.popular
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                                                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isCurrentPlan
                                        ? '✓ Current Plan'
                                        : loading && selectedPlan === plan.id
                                            ? 'Processing...'
                                            : plan.id === 'free'
                                                ? 'Default Plan'
                                                : 'Upgrade Now'}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="glass-card p-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
                            ⭐ Why Choose Premium?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Save More</h3>
                                <p className="text-sm text-slate-600">
                                    Get up to 15% cashback on every order
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Priority Support</h3>
                                <p className="text-sm text-slate-600">
                                    24/7 dedicated support team at your service
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                                    <Gift className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Exclusive Perks</h3>
                                <p className="text-sm text-slate-600">
                                    Access special restaurants and early deals
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
