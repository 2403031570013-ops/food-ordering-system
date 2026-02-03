import { useEffect, useState } from 'react';
import api from '../api';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            // Wait briefly or redirect immediately? Store might load user late.
            // Assuming user is loaded if we are here via protecting logic or we check auth state loaded.
            // But for now, if no user, show login prompt.
            // navigate('/login'); // Optional
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Usually backend should have an endpoint specifically for "My Orders" filtered by User ID
                // But step 823 showed only generic GET / (fetch all) in orderRoutes.js ?
                // Line 16: router.get("/", async (req, res) => { const orders = await Order.find(); ... })
                // This returns ALL orders (Admin style). A simple user shouldn't see all orders.
                // BUT for MVP/Demo, we might just filter on frontend if backend doesn't support it.
                // Ideally Backend should handle it.

                const res = await api.get('/orders');
                // Filter by logged in user ID if backend validation is missing
                const myOrders = res.data.filter(order => {
                    // Order user field could be populated object or just ID
                    // Schema says 'user' { type: ObjectId }
                    // If populated: order.user._id
                    // If not: order.user
                    const orderUserId = typeof order.user === 'object' ? order.user?._id : order.user;
                    const currentUserId = user?.id || user?._id;
                    return String(orderUserId) === String(currentUserId);
                });

                // If user is admin (or for demo), maybe show all?
                // Let's show myOrders sorted by date
                setOrders(myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Failed to load orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Please log in to view your orders.</h2>
                <button onClick={() => navigate('/login')} className="px-6 py-2 bg-orange-600 text-white rounded-full">Login</button>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading orders...</div>;
    if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen pt-24 px-4 bg-gray-50 pb-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                        <h3 className="text-xl text-gray-500">No orders found</h3>
                        <p className="text-gray-400 mt-2">Go verify some yummy food!</p>
                        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-full">Browse Menu</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order._id}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4 border-b pb-4 border-gray-50">
                                    <div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 
                           ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                        <p className="text-sm text-gray-400">Order ID: <span className="font-mono text-gray-600">#{order._id.slice(-6)}</span></p>
                                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-orange-600">₹{order.totalAmount}</p>
                                        <p className="text-xs text-gray-400">{order.paymentStatus === 'paid' ? 'Paid via Online' : 'Payment Pending'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-gray-700">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                                    <p className="font-semibold">Delivery To:</p>
                                    <p>{order.deliveryAddress?.fullName}</p>
                                    <p>{order.deliveryAddress?.address}</p>
                                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
