
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import api from '../api';
import {
    Users, ShoppingBag, Store, DollarSign,
    Eye
} from 'lucide-react';
import AdminAnalytics from './AdminAnalytics';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data.stats);
            setRecentOrders(response.data.recentOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-2xl font-bold text-slate-600">Loading...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'menu_requests', label: 'Menu Requests' },
    ];

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-5xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                        <p className="text-slate-600">Manage your food ordering platform</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-slate-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 px-1 text-lg font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <StatsGrid stats={stats} />
                            <QuickActions navigate={navigate} />
                            <RecentOrders recentOrders={recentOrders} />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AdminAnalytics />
                        </motion.div>
                    )}
                    {activeTab === 'menu_requests' && (
                        <motion.div
                            key="menu_requests"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MenuRequestView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatsGrid({ stats }) {
    const getColorClasses = (color) => {
        const colorMap = {
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        };
        return colorMap[color] || colorMap.blue;
    };

    const statCards = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
        { title: 'Restaurants', value: stats?.totalHotels || 0, icon: Store, color: 'green' },
        { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'orange' },
        { title: 'Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'purple' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((stat, index) => {
                const colors = getColorClasses(stat.color);
                return (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-full ${colors.bg}`}>
                                <stat.icon className={`w-8 h-8 ${colors.text}`} />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function QuickActions({ navigate }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/users')}
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow"
            >
                <Users className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Manage Users</h3>
                <p className="text-slate-600">View and manage all users</p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/restaurants')}
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow"
            >
                <Store className="w-10 h-10 text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Restaurants</h3>
                <p className="text-slate-600">Approve and manage restaurants</p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/orders')}
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow"
            >
                <ShoppingBag className="w-10 h-10 text-orange-600 mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Orders</h3>
                <p className="text-slate-600">Track and manage orders</p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/payments')}
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-emerald-50"
            >
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Payments</h3>
                <p className="text-slate-600">Reconcile & Refunds</p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/onboarding')}
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-10 h-10 text-purple-600" />
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">NEW</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Add Restaurant</h3>
                <p className="text-slate-600">Onboard a new partner</p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/restaurants?tab=requests')} // Navigate to Requests tab
                className="glass-card p-6 text-left hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-red-50"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Requests</h3>
                <p className="text-slate-600">Approve new signups</p>
            </motion.button>
        </div>
    );
}

function RecentOrders({ recentOrders }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
        >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Order ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Restaurant</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm">#{order._id.slice(-6)}</td>
                                <td className="py-3 px-4 text-sm">{order.user?.name || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm">{order.hotel?.name || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm font-semibold">₹{order.totalAmount}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <button className="text-blue-600 hover:text-blue-700">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

function MenuRequestView() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/admin/menu-setup/pending');
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleComplete = async (id) => {
        if (!window.confirm("Mark menu as ACTIVE? Confirm only if menu setup is complete.")) return;
        try {
            await api.put(`/admin/menu-setup/${id}/status`, { status: 'ACTIVE' });
            setRequests(prev => prev.filter(r => r._id !== id));
            alert("Menu marked active!");
        } catch (err) {
            alert("Error updating status");
        }
    };

    if (loading) return <div className="text-center py-10">Loading requests...</div>;

    return (
        <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Store className="w-6 h-6 text-orange-600" />
                Pending Menu Setup Requests
            </h2>

            {requests.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p>No pending menu requests found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map(req => (
                        <div key={req._id} className="border border-orange-100 rounded-xl p-6 bg-orange-50/30 hover:shadow-md transition-shadow relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">{req.name}</h3>
                                    <div className="text-sm text-slate-500 flex gap-4 mt-1">
                                        <span>{req.phone}</span>
                                        <span>•</span>
                                        <span>{req.email || req.contactEmail}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleComplete(req._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-green-200 transition-colors"
                                >
                                    ✅ Mark Setup Complete
                                </button>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provided Link</span>
                                    {req.menuLink ? (
                                        <a href={req.menuLink} target="_blank" rel="noreferrer" className="block text-blue-600 font-medium hover:underline break-all">
                                            {req.menuLink}
                                        </a>
                                    ) : (
                                        <p className="text-slate-400 italic text-sm">No link provided</p>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual Text details</span>
                                    <div className="mt-1 p-3 bg-slate-50 rounded text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-100">
                                        {req.menuText || 'No text details provided.'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-3 text-right">
                                Requested: {new Date(req.updatedAt || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
