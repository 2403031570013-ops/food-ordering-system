import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Store, User, Check, X, Search, Filter, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import SafeImage from '../components/SafeImage';

export default function AdminRestaurants() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'all';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of restaurant being processed

    useEffect(() => {
        fetchRestaurants();
    }, [activeTab]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            // Use admin-specific endpoint to get ALL hotels including pending
            const adminRes = await api.get('/admin/hotels');
            setRestaurants(adminRes.data);
        } catch (err) {
            console.error("Failed to fetch restaurants", err);
            // Fallback for demo if API fails
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await api.put(`/admin/hotels/${id}/approve`);
            toast.success('Restaurant approved successfully');
            fetchRestaurants(); // Refresh list
        } catch (err) {
            toast.error('Failed to approve restaurant');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this application?")) return;

        setActionLoading(id);
        try {
            await api.delete(`/admin/hotels/${id}/reject`);
            toast.success('Restaurant rejected');
            fetchRestaurants();
        } catch (err) {
            toast.error('Failed to reject restaurant');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingRestaurants = restaurants.filter(r => !r.approved);
    const activeRestaurants = restaurants.filter(r => r.approved);

    const displayedRestaurants = activeTab === 'requests' ? pendingRestaurants : activeRestaurants;

    return (
        <div className="min-h-screen pt-24 px-4 bg-slate-50 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Restaurant Management</h1>

                    {/* Tabs */}
                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'all'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Active Restaurants
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'requests'
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Requests
                            {pendingRestaurants.length > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'requests' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {pendingRestaurants.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader className="w-10 h-10 text-slate-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">Loading restaurants...</p>
                    </div>
                ) : displayedRestaurants.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Restaurants Found</h3>
                        <p className="text-slate-500">
                            {activeTab === 'requests' ? "No pending applications at the moment." : "No active restaurants found."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedRestaurants.map((restaurant) => (
                            <motion.div
                                key={restaurant._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card overflow-hidden group"
                            >
                                <div className="h-32 bg-slate-100 relative">
                                    <SafeImage
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${restaurant.approved
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {restaurant.approved ? 'Active' : 'Pending Review'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{restaurant.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                        <User className="w-4 h-4" /> {restaurant.owner || 'Owner'}
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        <p className="text-sm text-slate-600 truncate">📧 {restaurant.email}</p>
                                        <p className="text-sm text-slate-600">📞 {restaurant.phone}</p>
                                        <p className="text-sm text-slate-600 truncate">📍 {restaurant.address?.city || 'Location N/A'}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {!restaurant.approved ? (
                                            <>
                                                <button
                                                    onClick={() => handleReject(restaurant._id)}
                                                    disabled={actionLoading === restaurant._id}
                                                    className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(restaurant._id)}
                                                    disabled={actionLoading === restaurant._id}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-lg shadow-green-200 disabled:opacity-50 flex justify-center items-center gap-2"
                                                >
                                                    {actionLoading === restaurant._id ? 'Processing...' : (
                                                        <><Check className="w-4 h-4" /> Approve</>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <button className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-colors">
                                                Manage Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
