
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import api, { getStaticUrl } from '../api';
import {
    ArrowLeft, DollarSign, RefreshCcw, Search, Filter,
    CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminPayments() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    useEffect(() => {
        let result = orders;

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(order => order.paymentStatus === statusFilter);
        }

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                order._id.toLowerCase().includes(lowerTerm) ||
                order.user?.name?.toLowerCase().includes(lowerTerm) ||
                order.user?.email?.toLowerCase().includes(lowerTerm) ||
                order.razorpayPaymentId?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredOrders(result);
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            // Fetch all orders (backend now supports filtering but we fetch all for client-side ease in this admin view)
            const response = await api.get('/orders?limit=1000'); // changed from /admin/orders to /orders (admin restricted) or check route. 
            // Wait, previous file used /admin/orders. Let me check orderRoutes.js again.
            // orderRoutes.js: router.get("/", protect, restrictTo('admin', 'restaurant')...
            // So path is likely /api/orders.
            // AdminPayments.jsx used /admin/orders. 
            // If /admin/orders does not exist, it might have been /api/orders.
            // Let's assume /orders is the correct resource path based on standard REST.
            // Previous code used `api.get('/admin/orders')`. 
            // I should verify if `adminRoutes` existed and had `orders`?
            // "server/routes/adminRoutes.js" was listed in search. 
            // I should stick to what was there OR use the one I confirmed in orderRoutes which is GET /api/orders.
            // I'll try /orders first (mapped to /api/orders usually).
            // Actually, I'll stick to `api.get('/orders')` which hits `orderRoutes.js` `router.get('/', ...)`

            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback to /orders if /admin/orders failed?
            try {
                const res2 = await api.get('/orders');
                setOrders(res2.data);
                setFilteredOrders(res2.data);
                setLoading(false);
            } catch (err2) {
                toast.error('Failed to load orders');
                setLoading(false);
            }
        }
    };

    const handleRefund = async (orderId) => {
        if (!window.confirm('Are you sure you want to refund this ONLINE order? This will trigger Razorpay Refund.')) {
            return;
        }

        try {
            const response = await api.post('/payment/refund', { orderId });
            if (response.data.success) {
                toast.success('Online Refund initiated successfully');
                fetchOrders();
            }
        } catch (error) {
            console.error('Refund failed:', error);
            toast.error(error.response?.data?.message || 'Refund failed');
        }
    };

    const handleRefundStatusUpdate = async (orderId, newStatus) => {
        const note = prompt(`Enter note for marking as ${newStatus} (Optional):`);
        try {
            const response = await api.put(`/orders/${orderId}/refund-status`, {
                refundStatus: newStatus,
                note: note
            });
            if (response.data.success) {
                toast.success(`Refund status updated to ${newStatus}`);
                fetchOrders();
            }
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-2xl font-bold text-slate-600">Loading Payments...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Payment Reconciliation</h1>
                        <p className="text-slate-600">Monitor payments, verify transactions, and manage refunds</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search Order ID, User..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {['all', 'paid', 'pending', 'failed', 'refunded'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pyment Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Request</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-slate-600">
                                                #{order._id.slice(-6)}
                                            </span>
                                            {order.isDuplicatePayment && (
                                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                                    Duplicate
                                                </span>
                                            )}
                                            {order.refundStatus && order.refundStatus !== 'NONE' && (
                                                <div className="mt-1 text-[10px] font-bold text-slate-500 uppercase">
                                                    Refund: {order.refundStatus}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{order.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.paymentMethod || 'ONLINE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">₹{order.totalAmount}</div>
                                            <div className="text-xs text-slate-400">Total</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.paymentMethod === 'ONLINE' && order.paymentStatus === 'paid' && (
                                                <button
                                                    onClick={() => handleRefund(order._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.refundStatus === 'PROCESSING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (order.paymentMethod === 'COD') {
                                                                handleRefundStatusUpdate(order._id, 'COMPLETED');
                                                            } else {
                                                                // For Online, Approve triggers the actual refund flow
                                                                handleRefund(order._id);
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold hover:bg-green-200"
                                                        title={order.paymentMethod === 'COD' ? "Mark as Refunded/Resolved" : "Initiate Razorpay Refund"}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRefundStatusUpdate(order._id, 'NOT_REQUIRED')}
                                                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-200"
                                                        title="Reject Refund Request"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {(order.refundStatus === 'COMPLETED' || order.refundStatus === 'processed') && <span className="text-green-600 text-xs font-bold">Refunded</span>}
                                            {order.refundStatus === 'NOT_REQUIRED' && <span className="text-slate-400 text-xs text-center">Rejected</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        paid: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-purple-100 text-purple-700',
    };

    const icons = {
        paid: CheckCircle,
        pending: AlertCircle,
        failed: XCircle,
        refunded: RefreshCcw,
    };

    const Icon = icons[status] || AlertCircle;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${styles[status] || styles.pending}`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize">{status}</span>
        </span>
    );
}
