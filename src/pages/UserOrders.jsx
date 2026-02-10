
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, ShoppingBag, MapPin, FileText, CheckCircle, XCircle, Store, RefreshCw, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import api, { getStaticUrl } from '../api';
import Navbar from '../components/Navbar';
import SafeImage from '../components/SafeImage';
import RatingModal from '../components/RatingModal';

export default function UserOrders() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders/myorders');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchOrders();

        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [user, navigate, fetchOrders]);

    const handleCancelOrder = async (orderId) => {
        const reason = prompt("Please provide a reason for cancellation:");
        if (reason === null) return;

        try {
            setLoading(true);
            await api.post(`/orders/${orderId}/cancel`, { reason });
            alert("Order cancelled successfully.");
            fetchOrders();
        } catch (error) {
            console.error("Cancel failed", error);
            alert(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRating = (order) => {
        setSelectedOrder(order);
        setRatingModalOpen(true);
    };

    const handleRatingFinished = () => {
        fetchOrders();
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl font-bold text-slate-600">Loading your orders...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <Navbar />
            {selectedOrder && (
                <RatingModal
                    order={selectedOrder}
                    isOpen={ratingModalOpen}
                    onClose={() => setRatingModalOpen(false)}
                    onFinish={handleRatingFinished}
                />
            )}

            <div className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-sm transition-all hover:scale-105 hidden md:block"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
                            <p className="text-slate-500 mt-1">Track current orders and view past history</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm">
                        <RefreshCw className="w-3.5 h-3.5 text-green-600 animate-spin" />
                        <span className="text-xs font-bold text-slate-600">Live Updates On</span>
                    </div>
                </motion.div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50"
                    >
                        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">No orders yet</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Hungry? Explore our restaurants and find something delicious!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary shadow-orange-500/20"
                        >
                            Start Ordering
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {orders.map((order, index) => {
                                const isCancellable = ['PLACED', 'PREPARING', 'pending', 'accepted', 'preparing'].includes(order.status);
                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="glass-card overflow-hidden group hover:border-orange-200/50 transition-all duration-300"
                                    >
                                        <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-slate-50/50 to-white/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-1">
                                                    {order.hotel ? (
                                                        <SafeImage src={order.hotel.image} alt="Res" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                            <Store className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                        {order.hotel?.name || 'Restaurant'}
                                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                                    </h3>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wide">#{order._id.slice(-6)}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden md:block">
                                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">₹{order.totalAmount}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{order.items.length} items</div>
                                                </div>
                                                <OrderStatusBadge status={order.status} />
                                            </div>
                                        </div>

                                        {['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                                            <div className="px-6 py-5 bg-gradient-to-r from-orange-50/30 to-blue-50/30 border-b border-slate-100/50">
                                                <OrderTimeline status={order.status} />
                                            </div>
                                        )}

                                        <div className="p-6 bg-white/40">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <ShoppingBag className="w-3 h-3" /> Order Details
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between items-center text-sm group/item">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-700 rounded-md text-xs font-bold">
                                                                        {item.quantity}x
                                                                    </span>
                                                                    <span className="text-slate-700 font-medium group-hover/item:text-slate-900 transition-colors">{item.name}</span>
                                                                </div>
                                                                <span className="text-slate-600 font-semibold">₹{item.price * item.quantity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="md:w-72 md:border-l border-slate-100 md:pl-8 space-y-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <MapPin className="w-3 h-3" /> Delivery Address
                                                        </h4>
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                                                            {order.deliveryAddress?.address || 'No address provided'}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 space-y-2">
                                                        {order.invoiceUrl && (
                                                            <a
                                                                href={getStaticUrl(order.invoiceUrl)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white shadow-sm rounded-xl py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all hover:-translate-y-0.5"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Download Invoice
                                                            </a>
                                                        )}

                                                        {isCancellable && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="w-full flex items-center justify-center gap-2 border border-red-200 bg-red-50/50 shadow-sm rounded-xl py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                Cancel Order
                                                            </button>
                                                        )}

                                                        {['DELIVERED', 'delivered'].includes(order.status) && !order.rating && (
                                                            <button
                                                                onClick={() => handleOpenRating(order)}
                                                                className="w-full flex items-center justify-center gap-2 border border-orange-200 bg-orange-50 shadow-sm rounded-xl py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100 transition-all hover:-translate-y-0.5"
                                                            >
                                                                <Star className="w-4 h-4 fill-orange-700" />
                                                                Rate Order
                                                            </button>
                                                        )}

                                                        {order.rating && (
                                                            <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3">
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3 h-3 ${i < order.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">You Rated It</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {order.status === 'rejected' && (
                                            <div className="px-6 pb-6 bg-white/40">
                                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                                                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-red-700">Order Rejected</h4>
                                                        <p className="text-sm text-red-600 mt-1">{order.rejectionReason || 'The restaurant could not fulfill this order.'}</p>
                                                        {order.refundId && <p className="mt-2 text-xs font-mono bg-red-100/50 text-red-800 px-2 py-1 rounded inline-block">Refund ID: {order.refundId}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(order.status === 'CANCELLED' || order.status === 'cancelled') && (
                                            <div className="px-6 pb-6 bg-white/40">
                                                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex gap-3">
                                                    <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-700">Order Cancelled</h4>
                                                        <p className="text-sm text-slate-600 mt-1">Reason: {order.cancellationReason || 'User requested cancellation'}</p>
                                                        {order.refundStatus && order.refundStatus !== 'NONE' && (
                                                            <div className="mt-2 flex gap-2 items-center">
                                                                <span className="text-xs font-bold text-slate-500 uppercase">Refund Status:</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded font-mono ${order.refundStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    order.refundStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-slate-200 text-slate-700'
                                                                    }`}>
                                                                    {order.refundStatus}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderStatusBadge({ status }) {
    const normalizedStatus = (status || '').toLowerCase();
    const styles = {
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-100',
        placed: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-100',
        accepted: 'bg-green-50 text-green-700 border-green-200 ring-green-100',
        rejected: 'bg-red-50 text-red-700 border-red-200 ring-red-100',
        preparing: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100',
        ready: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100',
        'out-for-delivery': 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-100',
        out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-100',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
        cancelled: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-100',
    };

    const labels = {
        pending: '⏳ Placed',
        placed: '⏳ Placed',
        accepted: '✓ Confirmed',
        rejected: '✕ Rejected',
        preparing: '🍳 Cooking',
        ready: '📦 Ready',
        'out-for-delivery': '🚴 On Way',
        out_for_delivery: '🚴 On Way',
        delivered: '🎉 Delivered',
        cancelled: '🚫 Cancelled',
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ring-2 ring-opacity-50 shadow-sm ${styles[normalizedStatus] || styles.pending}`}>
            {labels[normalizedStatus] || status.replace(/-/g, ' ')}
        </span>
    );
}

function OrderTimeline({ status }) {
    const steps = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    let normalized = (status || '').toLowerCase();
    if (normalized === 'pending') normalized = 'placed';
    if (normalized === 'out-for-delivery') normalized = 'out_for_delivery';

    let currentIndex = steps.indexOf(normalized);
    if (currentIndex === -1) {
        if (normalized === 'confirmed') currentIndex = 1;
        if (normalized === 'placed') currentIndex = 0;
    }

    return (
        <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 rounded-full -translate-y-1/2" />
            <motion.div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full -translate-y-1/2"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const label = step === 'placed' ? 'Placed' :
                        step === 'accepted' ? 'Confirmed' :
                            step === 'preparing' ? 'Cooking' :
                                step === 'ready' ? 'Ready' :
                                    step === 'out_for_delivery' ? 'On Way' : 'Delivered';

                    const Icon = step === 'placed' ? FileText :
                        step === 'accepted' ? CheckCircle :
                            step === 'preparing' ? Clock :
                                step === 'ready' ? CheckCircle :
                                    step === 'out_for_delivery' ? MapPin : ShoppingBag;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    backgroundColor: isCompleted ? (isCurrent ? '#f97316' : '#22c55e') : '#e2e8f0',
                                    borderColor: isCurrent ? '#fff' : 'transparent'
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-sm z-10 transition-colors duration-300`}
                            >
                                <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </motion.div>
                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide transition-colors ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
