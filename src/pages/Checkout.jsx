import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { formatPrice } from '../utils/helpers';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, Loader2, Lock } from 'lucide-react';
import api from '../api';

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);

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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // State to store created Order ID for retries (Idempotency)
    const [existingOrderId, setExistingOrderId] = useState(null);

    const handlePayment = async () => {
        if (items.length === 0) return;

        // Basic Validation
        if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) {
            alert('Please fill in all required address fields.');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Load Script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Check your internet connection.');
            }

            // 2. Initiate Order (Create DB Order + Razorpay Order)
            // If we already initiated an order for this session, reuse it.
            const orderPayload = {
                items: items.map(item => ({
                    food: item._id || item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                deliveryAddress: {
                    fullName: address.fullName,
                    phone: address.phone,
                    email: address.email,
                    address: `${address.addressLine1}, ${address.addressLine2}`,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode
                },
                totalAmount: total,
                user: user?.id || user?._id,
                orderId: existingOrderId // Pass existing ID if available
            };

            const initiateRes = await api.post('/payment/initiate', orderPayload);

            if (!initiateRes.data.success) {
                // If it failed because it's already paid, handle that specially
                if (initiateRes.data.paymentStatus === 'paid') {
                    clearCart();
                    navigate('/order-success');
                    return;
                }
                throw new Error(initiateRes.data.message || 'Failed to initiate order');
            }

            const { orderId, razorpayOrderId, amount, currency, key } = initiateRes.data;

            // Store the Order ID so next click reuses it (Idempotency)
            setExistingOrderId(orderId);

            // 3. Open Razorpay
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: 'FoodHub',
                description: 'Order Payment',
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderId
                        });

                        if (verifyRes.data.success) {
                            // Payment Confirmed
                            clearCart();
                            navigate('/order-success'); // You might need to create this page or route to a success view
                        } else {
                            alert('Payment verification failed.');
                            setIsProcessing(false);
                        }
                    } catch (error) {
                        console.error('Verification Error:', error);
                        alert('Payment verification failed. Please contact support.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: address.fullName,
                    email: address.email,
                    contact: address.phone,
                },
                theme: {
                    color: '#FF6B35',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        // Do not alert "Cancelled" aggressively, just reset loading
                        console.log('Payment modal closed');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed", response.error);
                alert(`Payment process failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Payment Error:', error);
            // Enhanced Error Handling
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong processing your payment.';
            alert(errorMessage);
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        navigate('/cart');
        return null;
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

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Full Name *
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={address.fullName}
                                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="John Doe"
                                        disabled={isProcessing}
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone Number *
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={address.phone}
                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="9876543210"
                                        disabled={isProcessing}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={address.email}
                                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="john@example.com"
                                        disabled={isProcessing}
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="addressLine1" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        type="text"
                                        value={address.addressLine1}
                                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="House no., Building name"
                                        disabled={isProcessing}
                                        required
                                        autoComplete="address-line1"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="addressLine2" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Address Line 2
                                    </label>
                                    <input
                                        id="addressLine2"
                                        name="addressLine2"
                                        type="text"
                                        value={address.addressLine2}
                                        onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Road name, Area, Colony (Optional)"
                                        disabled={isProcessing}
                                        autoComplete="address-line2"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Mumbai"
                                        disabled={isProcessing}
                                        required
                                        autoComplete="address-level2"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="Maharashtra"
                                        disabled={isProcessing}
                                        autoComplete="address-level1"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="pincode" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                                        placeholder="400001"
                                        disabled={isProcessing}
                                        required
                                        autoComplete="postal-code"
                                    />
                                </div>
                            </form>
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
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Pay {formatPrice(total)}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-600 text-center mt-4">
                                🔒 Secure SSL payment powered by Razorpay
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
