import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, MessageSquare, Loader2, PartyPopper } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

export default function RatingModal({ order, isOpen, onClose, onFinish }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning('Please select a star rating! ⭐');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/orders/${order._id}/rate`, { rating, feedback });
            setIsSuccess(true);
            toast.success('Thank you for rating your meal! ❤️');
            setTimeout(() => {
                onClose();
                if (onFinish) onFinish();
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingText = (r) => {
        switch (r) {
            case 1: return 'Poor 😞';
            case 2: return 'Ok 😐';
            case 3: return 'Good 🙂';
            case 4: return 'Great! 😋';
            case 5: return 'Excelent! 😍';
            default: return 'Rate your meal';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center"
                    >
                        {!isSuccess ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6">
                                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-10 h-10 text-orange-600 fill-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">How was the food?</h2>
                                    <p className="text-slate-500 text-sm mt-1">Order #{order._id.slice(-6)} from {order.hotel?.name}</p>
                                </div>

                                {/* Stars */}
                                <div className="flex flex-col items-center gap-2 mb-8">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform active:scale-90"
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-200'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className={`text-sm font-bold transition-all px-4 py-1 rounded-full ${rating > 0 ? 'bg-orange-50 text-orange-600' : 'text-slate-400'}`}>
                                        {getRatingText(hoveredRating || rating)}
                                    </span>
                                </div>

                                {/* Feedback */}
                                <div className="relative mb-8 text-left">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Tell us more (Optional)
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Was the taste perfect? Delivery on time?"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all resize-none h-24 text-sm"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                        </span>
                                    ) : (
                                        'Submit Rating'
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="py-12 flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                >
                                    <PartyPopper className="w-12 h-12 text-green-600" />
                                </motion.div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Awesome!</h2>
                                <p className="text-slate-500">Your feedback helps us make FoodHub Now better for everyone.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
