import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { formatPrice } from '../utils/helpers';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail } from 'lucide-react';
import RazorpayPayment from '../components/RazorpayPayment';
import api from '../api'; // Import configured api client

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Address form state
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: '',
        email: user?.email || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 200 ? 0 : 40;
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;

    const handlePaymentSuccess = async (paymentData) => {
        console.log('Payment Successful!', paymentData);

        try {
            // Save the order to database
            const orderData = {
                items,
                address,
                paymentId: paymentData.paymentId,
                totalAmount: total,
                userId: user?.id || user?._id || "guest", // Ensure userId is passed
                status: "placed"
            };

            // Use api.post (uses correct Base URL)
            await api.post('/orders', orderData);

            setOrderPlaced(true);
            clearCart();

            // Redirect to success page after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Order placement error:', error);
            alert('Payment successful but order failed to save. Please contact support.');
        }
    };

    const handlePaymentFailure = (error) => {
        console.error('Payment Failed:', error);
        alert(`Payment failed! ${error}\nPlease try again.`);
    };

    // If cart is empty, redirect
    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    // If order is placed, show success message
    if (orderPlaced) {
        return (
            <div className="min-h-screen pt-20 pb-20 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-card p-12 max-w-md"
                >
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Placed!</h1>
                    <p className="text-slate-600 mb-6">
                        Your payment was successful and your delicious food is on its way!
                    </p>
                    <p className="text-sm text-slate-500">Redirecting to home...</p>
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
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </button>
                    <h1 className="text-5xl font-bold text-slate-900 mb-2">Checkout</h1>
                    <p className="text-slate-600">Complete your order</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Delivery Address Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 mb-6"
                        >
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-orange-600" />
                                Delivery Address
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={address.fullName}
                                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={address.phone}
                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="9876543210"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={address.email}
                                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine1}
                                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="House no., Building name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine2}
                                        onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Road name, Area, Colony (Optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Maharashtra"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="400001"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Order Summary & Payment */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-morphism rounded-2xl p-8 sticky top-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="mb-6 max-h-48 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center mb-3 pb-3 border-b border-white/20">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-slate-900">
                                                {item.name} <span className="text-slate-600">x{item.quantity}</span>
                                            </p>
                                        </div>
                                        <p className="font-semibold text-sm text-slate-900">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-slate-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-700">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">
                                        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-slate-700">
                                    <span>Tax (5%)</span>
                                    <span className="font-semibold">{formatPrice(tax)}</span>
                                </div>

                                <div className="h-px bg-white/20"></div>

                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-slate-900">Total</span>
                                    <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Payment
                                </h3>
                                <RazorpayPayment
                                    amount={Math.round(total)}
                                    onSuccess={handlePaymentSuccess}
                                    onFailure={handlePaymentFailure}
                                />
                            </div>

                            <p className="text-xs text-slate-600 text-center">
                                🔒 Secure payment powered by Razorpay
                            </p>

                            {deliveryFee === 0 && (
                                <p className="text-xs text-green-600 text-center mt-2">
                                    ✨ You're getting FREE delivery!
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
