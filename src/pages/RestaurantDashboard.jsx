
import { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChefHat, Clock, CheckCircle, Bell, Menu as MenuIcon, Plus, Trash2, Edit2, TrendingUp, DollarSign, ShoppingBag, Settings, LogOut, LayoutDashboard, ArrowDownCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store';

export default function RestaurantDashboard() {
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('orders');

    // Check application status on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/hotels/profile/me');
                setHotel(res.data);
            } catch (err) {
                console.error("Status check failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleToggleStatus = async () => {
        try {
            const res = await api.put('/hotels/profile/toggle-status');
            if (res.data.success) {
                setHotel(prev => ({ ...prev, isOpen: res.data.isOpen }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Toggle failed", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xl font-bold text-slate-600">Loading Dashboard...</div>
            </div>
        </div>
    );

    if (!hotel || !hotel.approved) {
        return <UnapprovedView status={hotel?.status} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6"
                >
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Restaurant Partner</span>
                        </div>
                        <p className="text-slate-500 font-medium">Manage your restaurant <span className="text-slate-900 font-bold">{hotel.name}</span></p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Status Toggle */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-4 px-6 py-3 rounded-2xl shadow-lg border transition-all cursor-pointer ${hotel.isOpen ? 'bg-green-600 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                            onClick={handleToggleStatus}
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-bold uppercase opacity-80 uppercase tracking-wider">Store Status</span>
                                <span className="text-lg font-bold">{hotel.isOpen ? 'OPEN' : 'CLOSED'}</span>
                            </div>
                            <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${hotel.isOpen ? 'bg-white/20' : 'bg-slate-200'}`}>
                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${hotel.isOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </motion.div>
                    </div>
                </motion.header>

                {/* TABS */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    <TabButton id="orders" label="Orders" icon={Bell} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="menu" label="Menu" icon={MenuIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="analytics" label="Reports" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <OrdersView hotelId={hotel._id} />
                        </motion.div>
                    )}
                    {activeTab === 'menu' && (
                        <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <MenuView hotel={hotel} />
                        </motion.div>
                    )}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <AnalyticsView hotelId={hotel._id} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TabButton({ id, label, icon: Icon, activeTab, setActiveTab }) {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 shadow-sm whitespace-nowrap font-bold ${isActive
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/30 scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            {label}
        </button>
    );
}

function OrdersView({ hotelId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Track which order is being processed

    const fetchOrders = async () => {
        try {
            // Use NEW restaurant-specific endpoint
            const res = await api.get('/restaurant/orders');
            setOrders(res.data.orders || []);
            setLoading(false);
        } catch (err) {
            console.error("Fetch orders error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Real-time polling every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    // ACCEPT ORDER
    const handleAccept = async (orderId) => {
        setActionLoading(orderId);
        try {
            await api.patch(`/restaurant/orders/${orderId}/accept`);
            toast.success('Order Accepted! 🎉');
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept order');
        } finally {
            setActionLoading(null);
        }
    };

    // REJECT ORDER (with auto-refund)
    const handleReject = async (orderId) => {
        const reason = window.prompt('Reason for rejection (optional):', 'Item unavailable');
        if (reason === null) return; // User cancelled

        setActionLoading(orderId);
        try {
            await api.patch(`/restaurant/orders/${orderId}/reject`, { reason });
            toast.info('Order Rejected. Refund initiated if applicable.');
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject order');
        } finally {
            setActionLoading(null);
        }
    };

    // UPDATE STATUS (preparing, ready, out-for-delivery, delivered)
    const updateStatus = async (orderId, newStatus) => {
        setActionLoading(orderId);
        try {
            await api.patch(`/restaurant/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus.replace('-', ' ')}`);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    // Categorize orders
    const pendingOrders = orders.filter(o => ['pending', 'PLACED'].includes(o.status));
    const acceptedOrders = orders.filter(o => ['accepted', 'ACCEPTED'].includes(o.status));
    const activeOrders = orders.filter(o => ['preparing', 'PREPARING', 'ready', 'READY', 'out-for-delivery', 'OUT_FOR_DELIVERY'].includes(o.status));
    const completedOrders = orders.filter(o => ['delivered', 'DELIVERED', 'rejected', 'REJECTED', 'cancelled', 'CANCELLED'].includes(o.status));

    if (loading) return <div className="text-center py-20 text-slate-500 flex flex-col items-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>Fetching Delivery Items...</div>;

    return (
        <div className="space-y-12">
            {/* PENDING - New Orders Awaiting Acceptance */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600 animate-pulse">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Incoming Orders</h2>
                        <p className="text-sm text-slate-500">{pendingOrders.length} orders waiting for your action</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOrders.map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            type="pending"
                            onAccept={handleAccept}
                            onReject={handleReject}
                            isLoading={actionLoading === order._id}
                        />
                    ))}
                    {pendingOrders.length === 0 && <EmptyState type="pending" />}
                </div>
            </section>

            {/* ACCEPTED - Orders to Start Preparing */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Kitchen Prep</h2>
                        <p className="text-sm text-slate-500">{acceptedOrders.length} orders ready to cook</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {acceptedOrders.map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            type="accepted"
                            onUpdate={updateStatus}
                            isLoading={actionLoading === order._id}
                        />
                    ))}
                    {acceptedOrders.length === 0 && <EmptyState type="accepted" />}
                </div>
            </section>

            {/* IN KITCHEN - Preparing/Ready/Out for Delivery */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">In Progress</h2>
                        <p className="text-sm text-slate-500">{activeOrders.length} orders being processed</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeOrders.map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            type="active"
                            onUpdate={updateStatus}
                            isLoading={actionLoading === order._id}
                        />
                    ))}
                    {activeOrders.length === 0 && <EmptyState type="active" />}
                </div>
            </section>

            {/* HISTORY */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Recent History</h2>
                        <p className="text-sm text-slate-500">Last 10 completed orders</p>
                    </div>
                </div>
                <div className="glass-card overflow-hidden">
                    {completedOrders.slice(0, 10).map((order) => (
                        <div key={order._id} className="p-5 flex justify-between items-center border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">#{order._id.slice(-6)}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
                                    <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${['delivered', 'DELIVERED'].includes(order.status) ? 'bg-green-100 text-green-700' :
                                ['rejected', 'REJECTED'].includes(order.status) ? 'bg-red-100 text-red-700' :
                                    ['cancelled', 'CANCELLED'].includes(order.status) ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    ))}
                    {completedOrders.length === 0 && <div className="p-8 text-center text-slate-400 italic">No order history available</div>}
                </div>
            </section>
        </div>
    );
}

function OrderCard({ order, type, onAccept, onReject, onUpdate, isLoading }) {
    const borderColor = type === 'pending' ? 'border-orange-500 shadow-orange-100' :
        type === 'accepted' ? 'border-green-500 shadow-green-100' : 'border-blue-500 shadow-blue-100';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card border-l-4 p-6 ${borderColor} ${isLoading ? 'opacity-60 pointer-events-none' : ''} hover:shadow-xl transition-all duration-300 relative group`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-dashed border-slate-200">
                <div>
                    <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded font-mono">#{order._id.slice(-6)}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-extrabold text-2xl text-slate-900">₹{order.totalAmount}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</p>
                </div>
            </div>

            {/* Customer Info */}
            {order.user && (
                <div className="mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                        {order.user.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-800">{order.user.name || 'Customer'}</p>
                        <p className="text-xs text-slate-400">{order.user.phone || order.deliveryAddress?.phone}</p>
                    </div>
                </div>
            )}

            {/* Address */}
            {order.deliveryAddress && (
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{order.deliveryAddress.address}, {order.deliveryAddress.city}</p>
                </div>
            )}

            {/* Items */}
            <div className="space-y-2 mb-6">
                {order.items.map((item, i) => (
                    <div key={i} className="text-sm flex justify-between items-center group/item hover:bg-slate-50 p-1 rounded transition-colors">
                        <span className="flex items-center gap-2">
                            <span className="font-bold text-white bg-slate-800 w-5 h-5 rounded flex items-center justify-center text-xs">{item.quantity}</span>
                            <span className="text-slate-600">{item.name}</span>
                        </span>
                        <span className="text-slate-400 font-medium text-xs">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            {/* PENDING Actions: Accept / Reject */}
            {type === 'pending' && (
                <div className="flex gap-3">
                    <button
                        onClick={() => onReject(order._id)}
                        disabled={isLoading}
                        className="flex-1 py-3 text-red-600 text-sm font-bold hover:bg-red-50 rounded-xl border border-red-100 transition disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Reject'}
                    </button>
                    <button
                        onClick={() => onAccept(order._id)}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition disabled:opacity-50 transform hover:scale-[1.02]"
                    >
                        {isLoading ? '...' : 'Accept Order'}
                    </button>
                </div>
            )}

            {/* ACCEPTED Actions: Start Preparing */}
            {type === 'accepted' && (
                <button
                    onClick={() => onUpdate(order._id, 'preparing')}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <ChefHat className="w-4 h-4" />
                    {isLoading ? '...' : 'Start Preparing'}
                </button>
            )}

            {/* ACTIVE Actions: Preparing → Ready → Out for Delivery → Delivered */}
            {type === 'active' && (
                <div className="flex flex-col gap-2">
                    {order.status === 'preparing' && (
                        <button onClick={() => onUpdate(order._id, 'ready')} disabled={isLoading} className="w-full py-3 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-200 transition">
                            ✅ Mark Ready for Pickup
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button onClick={() => onUpdate(order._id, 'out-for-delivery')} disabled={isLoading} className="w-full py-3 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-xl hover:bg-yellow-200 transition flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" /> Out for Delivery
                        </button>
                    )}
                    {order.status === 'out-for-delivery' && (
                        <button onClick={() => onUpdate(order._id, 'delivered')} disabled={isLoading} className="w-full py-3 bg-green-100 text-green-700 text-sm font-bold rounded-xl hover:bg-green-200 transition flex items-center justify-center gap-2">
                            🎉 Confirm Delivery
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

function EmptyState({ type }) {
    const content = {
        pending: { text: "No pending orders", sub: "Waiting for new customers..." },
        accepted: { text: "Kitchen is clear", sub: "No orders waiting to be cooked" },
        active: { text: "No active orders", sub: "All orders have been delivered" }
    }[type];

    return (
        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{content.text}</h3>
            <p className="text-slate-500">{content.sub}</p>
        </div>
    )
}

function MenuView({ hotel }) {
    const [foods, setFoods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [menuLink, setMenuLink] = useState(hotel.menuLink || '');
    const [menuText, setMenuText] = useState(hotel.menuText || '');
    const [submitLoading, setSubmitLoading] = useState(false);

    const onOnboardingSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/restaurant/menu-setup', { menuLink, menuText });
            toast.success("Menu submitted for setup!");
            window.location.reload();
        } catch (err) {
            toast.error("Failed to submit");
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchFoods = async () => {
        try {
            const res = await api.get(`/foods?hotelId=${hotel._id}`);
            setFoods(res.data);
        } catch (err) {
            console.error("Failed to fetch menu", err);
        }
    };

    useEffect(() => {
        if (hotel.menuStatus === 'ACTIVE') {
            fetchFoods();
        }
    }, [hotel._id, hotel.menuStatus]);


    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            await api.delete(`/foods/${id}`);
            setFoods(prev => prev.filter(f => f._id !== id));
            toast.success("Item deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // ONBOARDING VIEW
    if (hotel.menuStatus && hotel.menuStatus !== 'ACTIVE') {
        const statusColors = {
            'PENDING_SETUP': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
            'REJECTED': 'bg-red-100 text-red-800 border-red-200'
        };

        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <MenuIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Menu Setup Assistant</h2>
                    <p className="text-slate-500 mt-2 text-lg">Let our team handle the tedious data entry for you.</p>
                </div>

                <div className={`p-4 rounded-xl border mb-8 text-center font-bold uppercase tracking-widest ${statusColors[hotel.menuStatus] || 'bg-slate-100'}`}>
                    Status: {hotel.menuStatus?.replace('_', ' ')}
                </div>

                <div className="glass-card p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600" />
                    <form onSubmit={onOnboardingSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Menu File Link</label>
                            <input
                                className="input-field"
                                placeholder="Paste link to Google Drive, Dropbox, Website, or PDF URL..."
                                value={menuLink}
                                onChange={e => setMenuLink(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">Accepts PDF, Excel, Images, or Website URLs.</p>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-bold">OR TYPE MANUALLY</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Menu Details</label>
                            <textarea
                                className="input-field h-40"
                                placeholder="List your items here (Name - Price - Description)..."
                                value={menuText}
                                onChange={e => setMenuText(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="w-full btn-primary py-4 text-lg shadow-lg shadow-orange-200 group"
                        >
                            {submitLoading ? 'Submitting...' : 'Submit to Admin Team'}
                            {!submitLoading && <Check className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    Need help? Contact support@foodhubnow.com
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Menu Management</h2>
                    <p className="text-slate-500">Manage your {foods.length} items</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => { setEditingFood(null); setIsModalOpen(true); }}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        <Plus className="w-5 h-5" /> Add New Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods.map(food => (
                    <div key={food._id} className="glass-card p-4 flex gap-4 group hover:border-orange-200 transition-all">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm shrink-0">
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 line-clamp-1">{food.name}</h3>
                                <span className="font-extrabold text-orange-600">₹{food.price}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-auto">{food.description}</p>

                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                <button onClick={() => { setEditingFood(food); setIsModalOpen(true); }} className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1">
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button onClick={() => handleDelete(food._id)} className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <FoodModal
                    food={editingFood}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => { setIsModalOpen(false); fetchFoods(); }}
                />
            )}
        </div>
    );
}

function FoodModal({ food, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: food?.name || '',
        description: food?.description || '',
        price: food?.price || '',
        category: food?.category || 'Indian',
        image: food?.image || '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (food) {
                await api.put(`/foods/${food._id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/foods', formData);
                toast.success("Created successfully");
            }
            onSave();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
                <h3 className="text-2xl font-bold mb-6 text-slate-900 border-b pb-4">{food ? 'Edit Menu Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
                        <input required className="input-field" placeholder="e.g. Butter Chicken" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea required className="input-field resize-none" rows={3} placeholder="Describe the dish..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
                            <input type="number" required className="input-field" placeholder="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select className="input-field appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Indian</option>
                                <option>Chinese</option>
                                <option>Fast Food</option>
                                <option>Dessert</option>
                                <option>Beverage</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input type="url" required className="input-field" placeholder="https://" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>

                    <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all">Save Item</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

function AnalyticsView({ hotelId }) {
    const [range, setRange] = useState('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (range !== 'custom') fetchData();
        // eslint-disable-next-line
    }, [range]);

    const buildQuery = () => {
        if (range === 'custom' && customStart && customEnd) {
            return `range=custom&startDate=${customStart}&endDate=${customEnd}`;
        }
        return `range=${range}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = buildQuery();
            const [summaryRes, ordersRes] = await Promise.all([
                api.get(`/restaurant/reports/summary?${q}`),
                api.get(`/restaurant/reports/orders?${q}`)
            ]);
            setSummary(summaryRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Report fetch error", err);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    };

    const applyCustom = () => {
        if (!customStart || !customEnd) return toast.error("Select both dates");
        if (new Date(customStart) > new Date(customEnd)) return toast.error("Start date must be before end date");
        setRange('custom');
        setTimeout(() => fetchData(), 0);
    };

    const downloadFile = async (type) => {
        try {
            const q = buildQuery();
            const response = await api.get(`/restaurant/reports/${type}?${q}`, { responseType: 'blob' });
            const ext = type === 'excel' ? 'xlsx' : type;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FoodHubNow_Report_${range}_${new Date().toISOString().split('T')[0]}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`${type.toUpperCase()} downloaded`);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to download ${type.toUpperCase()}`);
        }
    };

    const ranges = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: '7 Days' },
        { id: 'month', label: '30 Days' },
        { id: 'year', label: '1 Year' },
    ];

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="glass-card p-5">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                        {ranges.map(r => (
                            <button key={r.id} onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${range === r.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>{r.label}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        <span className="text-slate-400 text-sm">to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                        <button onClick={applyCustom}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">Apply</button>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => downloadFile('pdf')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5">
                            <ArrowDownCircle className="w-4 h-4" /> PDF</button>
                        <button onClick={() => downloadFile('csv')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-1.5">
                            <ArrowDownCircle className="w-4 h-4" /> CSV</button>
                        <button onClick={() => downloadFile('excel')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                            <ArrowDownCircle className="w-4 h-4" /> Excel</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">Generating Report...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex items-center gap-4 border-l-4 border-green-500">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full"><DollarSign className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase">Total Revenue</p>
                                <p className="text-3xl font-extrabold text-slate-900">₹{(summary.totalRevenue || 0).toLocaleString()}</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex items-center gap-4 border-l-4 border-blue-500">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingBag className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase">Total Orders</p>
                                <p className="text-3xl font-extrabold text-slate-900">{summary.totalOrders}</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex items-center gap-4 border-l-4 border-purple-500">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><TrendingUp className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase">Avg. Order Value</p>
                                <p className="text-3xl font-extrabold text-slate-900">₹{(summary.avgOrderValue || 0).toLocaleString()}</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800">Order History ({orders.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider text-left">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50 transition-colors text-sm">
                                            <td className="p-4 font-mono text-slate-500">#{order._id.slice(-6)}</td>
                                            <td className="p-4 text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                <span className="block text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="p-4 font-bold text-slate-700">{order.user?.name || 'Guest'}</td>
                                            <td className="p-4 font-extrabold text-slate-900">₹{order.totalAmount}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${['delivered', 'DELIVERED'].includes(order.status) ? 'bg-green-100 text-green-600' :
                                                    ['cancelled', 'CANCELLED'].includes(order.status) ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No orders found for this period.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function UnapprovedView({ status }) {
    return (
        <div className="min-h-screen pt-24 px-4 bg-slate-50 flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full glass-card p-10 text-center relative z-10"
            >
                <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-orange-50/50">
                    <Clock className="w-10 h-10 animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Application Under Review</h2>
                <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                    Hang tight! Our team is reviewing your restaurant details. You'll be ready to serve hungry customers in no time.
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center mb-8 border border-slate-100">
                    <div className="text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                        <p className="text-slate-900 font-bold text-lg capitalize">{status || 'Pending Review'}</p>
                    </div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                </div>

                <div className="text-sm text-slate-400 flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" /> We'll notify you via email
                </div>
            </motion.div>
        </div>
    );
}
