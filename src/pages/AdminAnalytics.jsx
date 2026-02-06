
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../api';
import { TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react';

export default function AdminAnalytics() {
    const [salesData, setSalesData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salesRes, paymentRes, restRes] = await Promise.all([
                    api.get('/admin/analytics/sales'),
                    api.get('/admin/analytics/payments'),
                    api.get('/admin/analytics/top-restaurants')
                ]);

                setSalesData(salesRes.data);
                setPaymentData(paymentRes.data);
                setTopRestaurants(restRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

    // Calculate Summary Stats
    const totalRevenue = salesData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalOrders = salesData.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">Platform Analytics</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={TrendingUp} title="Total Revenue" value={`₹${totalRevenue}`} color="blue" />
                <StatCard icon={ShoppingBag} title="Total Orders" value={totalOrders} color="orange" />
                <StatCard icon={Users} title="Active Users" value="1,204" color="green" /> {/* Mock for now */}
                <StatCard icon={DollarSign} title="Avg. Order Value" value={`₹${Math.round(totalRevenue / (totalOrders || 1))}`} color="purple" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Sales Trend (Last 30 Days)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalRevenue" stroke="#ea580c" strokeWidth={2} name="Revenue (₹)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Restaurants */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Top Performing Restaurants</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRestaurants} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Status Distribution */}
                <div className="glass-card p-6 lg:col-span-1">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Payment Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Table (Placeholder) */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 text-slate-700">Detailed Payment Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Count</th>
                                    <th className="px-6 py-3">Total Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentData.map((item, index) => (
                                    <tr key={index} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-slate-900 capitalize">{item._id}</td>
                                        <td className="px-6 py-4">{item.count}</td>
                                        <td className="px-6 py-4">₹{item.totalAmount}</td>
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

function StatCard({ icon: Icon, title, value, color }) {
    const colorClasses = {
        blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
        orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
        green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    };

    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`glass-card p-6 border-l-4 ${classes.border}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-sm font-semibold uppercase">{title}</h3>
                <div className={`p-2 ${classes.bg} rounded-lg ${classes.text}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    );
}
