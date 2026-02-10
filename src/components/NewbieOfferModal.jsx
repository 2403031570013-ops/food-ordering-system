import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, Copy, Check, PartyPopper } from 'lucide-react';
import { useAuthStore } from '../store';
import { toast } from 'react-toastify';

export default function NewbieOfferModal() {
    const { user } = useAuthStore();
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Show if user is logged in, is a customer, and hasn't seen it this session
        const hasSeen = sessionStorage.getItem('hasSeenNewbieOffer');
        if (user && user.role === 'user' && !hasSeen) {
            const timer = setTimeout(() => {
                setShow(true);
            }, 2000); // Delay for 2 seconds to not overwhelm
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleClose = () => {
        setShow(false);
        sessionStorage.setItem('hasSeenNewbieOffer', 'true');
    };

    const copyCode = () => {
        navigator.clipboard.writeText('NEWBIE');
        setCopied(true);
        toast.success('Code copied! Use it at checkout. 🍕');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Design Elements */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-500 to-red-600" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative pt-12 pb-10 px-8 flex flex-col items-center text-center">
                            {/* Icon Container */}
                            <div className="mb-6 relative">
                                <div className="absolute -inset-4 bg-orange-100 rounded-full animate-ping opacity-20" />
                                <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-12 group">
                                    <Gift className="w-12 h-12 text-orange-600 transition-transform group-hover:scale-110" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
                                <PartyPopper className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400" />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome to FoodHub Now!</h2>
                            <p className="text-slate-500 mb-8 max-w-xs">
                                We're so glad you're here. Start your food journey with a massive discount on your first order!
                            </p>

                            {/* Offer Card */}
                            <div className="w-full bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-orange-200 mb-8">
                                <div className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Limited Time Offer</div>
                                <div className="text-4xl font-black text-slate-900 mb-4 tracking-tight">50% OFF</div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 px-4 flex items-center justify-between">
                                        <span className="font-black text-xl text-slate-800 tracking-widest">NEWBIE</span>
                                        <button
                                            onClick={copyCode}
                                            className="flex items-center gap-2 text-orange-600 font-bold text-sm bg-orange-50 py-1.5 px-3 rounded-xl transition-all active:scale-95"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">
                                    *T&C Apply • Valid on first order above ₹199
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Let's Order Something!
                            </button>

                            <button
                                onClick={handleClose}
                                className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Maybe Later
                            </button>
                        </div>

                        {/* Bottom Confetti or Decorations */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
