
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../api';
import { TrendingUp, DollarSign, Users, ShoppingBag, ArrowDownCircle, Store } from 'lucide-react';

export default function AdminAnalytics() {
    const [range, setRange] = useState('month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [groupBy, setGroupBy] = useState('day');
    const [summary, setSummary] = useState({});
    const [trend, setTrend] = useState([]);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [paymentSplit, setPaymentSplit] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (range !== 'custom') fetchAll();
        // eslint-disable-next-line
    }, [range, groupBy]);

    const buildQ = () => {
        if (range === 'custom' && customStart && customEnd) {
            return `range=custom&startDate=${customStart}&endDate=${customEnd}`;
        }
        return `range=${range}`;
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const q = buildQ();
            const [sumRes, trendRes, topRes, splitRes] = await Promise.all([
                api.get(`/admin/analytics/summary?${q}`),
                api.get(`/admin/analytics/revenue-trend?${q}&groupBy=${groupBy}`),
                api.get(`/admin/analytics/top-restaurants?${q}`),
                api.get(`/admin/analytics/payment-split?${q}`)
            ]);
            setSummary(sumRes.data);
            setTrend(trendRes.data);
            setTopRestaurants(topRes.data);
            setPaymentSplit(splitRes.data);
        } catch (e) {
            console.error('Admin Analytics Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const applyCustom = () => {
        if (!customStart || !customEnd) return;
        setRange('custom');
        setTimeout(() => fetchAll(), 0);
    };

    const downloadFile = async (type) => {
        try {
            const q = buildQ();
            const response = await api.get(`/admin/analytics/${type}?${q}`, { responseType: 'blob' });
            const ext = type === 'excel' ? 'xlsx' : type;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FoodHubNow_Platform_${range}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error(e);
        }
    };

    const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

    const ranges = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: '7 Days' },
        { id: 'month', label: '30 Days' },
        { id: 'year', label: '1 Year' },
    ];

    if (loading) return (
        <div className="p-10 text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Platform Analytics — FoodHub Now</h2>
            </div>

            {/* Controls */}
            <div className="glass-card p-5">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Presets */}
                    <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                        {ranges.map(r => (
                            <button key={r.id} onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${range === r.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>{r.label}</button>
                        ))}
                    </div>

                    {/* Custom Date */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <span className="text-slate-400">to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <button onClick={applyCustom}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">Apply</button>
                    </div>

                    {/* Downloads */}
                    <div className="flex gap-2">
                        <button onClick={() => downloadFile('csv')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1.5">
                            <ArrowDownCircle className="w-4 h-4" /> CSV</button>
                        <button onClick={() => downloadFile('excel')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1.5">
                            <ArrowDownCircle className="w-4 h-4" /> Excel</button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={DollarSign} title="Total Revenue" value={`₹${(summary.totalRevenue || 0).toLocaleString()}`} color="green" />
                <StatCard icon={ShoppingBag} title="Total Orders" value={summary.totalOrders || 0} color="blue" />
                <StatCard icon={Users} title="Platform Users" value={summary.totalUsers || 0} color="orange" />
                <StatCard icon={Store} title="Active Restaurants" value={summary.totalRestaurants || 0} color="purple" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend */}
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-700">Revenue Trend</h3>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                            {['day', 'month', 'year'].map(g => (
                                <button key={g} onClick={() => setGroupBy(g)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md ${groupBy === g ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2.5} name="Revenue (₹)" dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Restaurants */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Top Restaurants by Revenue</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRestaurants} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COD vs Online */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">COD vs Online</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={paymentSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                    fill="#8884d8" paddingAngle={4} dataKey="revenue" nameKey="_id" label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}>
                                    {paymentSplit.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {paymentSplit.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="font-medium text-slate-700">{item._id || 'Unknown'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900">₹{(item.revenue || 0).toLocaleString()}</span>
                                    <span className="text-slate-400 ml-2">({item.count} orders)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Restaurants Table */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Restaurant Performance Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <th className="p-4 text-left">Rank</th>
                                    <th className="p-4 text-left">Restaurant</th>
                                    <th className="p-4 text-right">Orders</th>
                                    <th className="p-4 text-right">Revenue</th>
                                    <th className="p-4 text-right">Avg. Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topRestaurants.map((r, i) => (
                                    <tr key={r._id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-slate-100 text-slate-600' :
                                                        i === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-slate-50 text-slate-400'
                                                }`}>{i + 1}</span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">{r.name || 'Unknown'}</td>
                                        <td className="p-4 text-right text-slate-600">{r.orders}</td>
                                        <td className="p-4 text-right font-extrabold text-slate-900">₹{(r.revenue || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right text-slate-500">₹{r.orders ? Math.round(r.revenue / r.orders).toLocaleString() : 0}</td>
                                    </tr>
                                ))}
                                {topRestaurants.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No data for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, value, color }) {
    const colorClasses = {
        blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
        orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
        green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    };
    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 border-l-4 ${classes.border}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-sm font-semibold uppercase">{title}</h3>
                <div className={`p-2 ${classes.bg} rounded-lg ${classes.text}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </motion.div>
    );
}
