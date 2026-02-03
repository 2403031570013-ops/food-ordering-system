import { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChefHat, Clock, CheckCircle, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RestaurantDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Poll for new orders every 10 seconds (Simulating Real-time)
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            // In real app, filter data by Restaurant ID
            // For Demo, showing ALL recent orders sorted by date
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            // Optimistic UI Update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
            fetchOrders(); // Revert on failure
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'pending' || !o.status);
    const activeOrders = orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
    const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).slice(0, 10); // Show last 10

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Restaurant Partner Dashboard</h1>
                        <p className="text-slate-500">Manage your incoming orders in real-time</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-semibold text-slate-700">Live & Accepting Orders</span>
                    </div>
                </header>

                {/* --- PENDING ORDERS SECTION --- */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-orange-600">
                        <Bell className="w-6 h-6" />
                        New Orders ({pendingOrders.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {pendingOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    type="pending"
                                    onAccept={() => updateStatus(order._id, 'preparing')}
                                    onReject={() => updateStatus(order._id, 'cancelled')}
                                />
                            ))}
                            {pendingOrders.length === 0 && (
                                <div className="col-span-full py-10 text-center bg-white rounded-xl border border-dashed text-slate-400">
                                    No new orders yet. Waiting for hungry customers! 🍔
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* --- ACTIVE / KITCHEN SECTION --- */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-blue-600">
                        <ChefHat className="w-6 h-6" />
                        Kitchen & Delivery ({activeOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeOrders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                type="active"
                                onUpdate={(status) => updateStatus(order._id, status)}
                            />
                        ))}
                    </div>
                </section>

                {/* --- COMPLETED HISTORY --- */}
                <section>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-600">
                        <CheckCircle className="w-6 h-6" />
                        Recent History
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        {completedOrders.map((order, i) => (
                            <div key={order._id} className={`p-4 flex justify-between items-center ${i !== completedOrders.length - 1 ? 'border-b' : ''}`}>
                                <div>
                                    <span className="font-mono text-xs text-slate-400">#{order._id.slice(-6)}</span>
                                    <span className={`ml-3 px-2 py-0.5 rounded text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold">₹{order.totalAmount}</div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

// --- Component: Order Card ---
function OrderCard({ order, type, onAccept, onReject, onUpdate }) {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            layout
            className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${type === 'pending' ? 'border-orange-500 shadow-orange-100' : 'border-blue-500 shadow-blue-100'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg">Order #{order._id.slice(-4)}</h3>
                    <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">₹{order.totalAmount}</p>
                    <p className="text-xs text-green-600 font-semibold">{order.paymentStatus === 'paid' ? 'PAID' : 'COD'}</p>
                </div>
            </div>

            <div className="border-t border-b border-slate-50 py-3 my-3 space-y-1">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-slate-700">
                        <span><span className="font-bold">{item.quantity}x</span> {item.name || "Item"}</span>
                    </div>
                ))}
            </div>

            <div className="text-xs text-slate-500 mb-4">
                <p>📍 {order.deliveryAddress?.address}, {order.deliveryAddress?.city}</p>
            </div>

            {/* Actions */}
            {type === 'pending' && (
                <div className="flex gap-3 mt-4">
                    <button onClick={onReject} className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors">
                        Reject
                    </button>
                    <button onClick={onAccept} className="flex-1 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200 font-semibold text-sm transition-all flex justify-center items-center gap-2">
                        <Check className="w-4 h-4" /> Accept
                    </button>
                </div>
            )}

            {type === 'active' && (
                <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                        {order.status === 'preparing' && (
                            <button onClick={() => onUpdate('ready')} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200">
                                Mark Ready
                            </button>
                        )}
                        {order.status === 'ready' && (
                            <button onClick={() => onUpdate('delivered')} className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200">
                                Mark Delivered
                            </button>
                        )}
                        {order.status === 'preparing' && (
                            <div className="w-full text-center text-xs text-orange-500 animate-pulse flex items-center justify-center gap-1">
                                <ChefHat className="w-3 h-3" /> Preparing...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
