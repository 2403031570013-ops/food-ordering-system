
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
            const response = await api.get('/admin/orders');
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
            setLoading(false);
        }
    };

    const handleRefund = async (orderId) => {
        if (!window.confirm('Are you sure you want to refund this order? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await api.post('/payment/refund', { orderId });
            if (response.data.success) {
                toast.success('Refund initiated successfully');
                fetchOrders(); // Refresh list
            }
        } catch (error) {
            console.error('Refund failed:', error);
            toast.error(error.response?.data?.message || 'Refund failed');
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
                            placeholder="Search Order ID, User, or Payment ID..."
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{order.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">₹{order.totalAmount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-mono text-xs text-slate-500">
                                                {order.razorpayPaymentId || '-'}
                                                {order.razorpayOrderId && (
                                                    <div className="text-[10px] text-slate-400 mt-1">
                                                        Ord: {order.razorpayOrderId}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.invoiceUrl && (
                                                <a
                                                    href={getStaticUrl(order.invoiceUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    PDF
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.paymentStatus === 'paid' && (
                                                <button
                                                    onClick={() => handleRefund(order._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    Refund
                                                </button>
                                            )}
                                            {order.paymentStatus === 'refunded' && (
                                                <div className="text-xs text-green-600 font-medium">
                                                    Refunded: ₹{order.refundAmount}
                                                </div>
                                            )}
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
