import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Sparkles, Clock, Check, Copy, Gift, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';

const demoCoupons = [
    {
        id: 1,
        code: 'NEWBIE',
        title: 'First Order Special',
        description: 'Get 50% OFF on your very first order!',
        discount: '50% OFF',
        expiry: 'Valid for 7 days',
        type: 'new_user',
        color: 'from-orange-400 to-red-500'
    },
    {
        id: 2,
        code: 'WELCOME50',
        title: 'Welcome Back',
        description: 'Enjoy 50% discount up to ₹150.',
        discount: '50% OFF',
        expiry: 'Limited Time Offer',
        type: 'all_users',
        color: 'from-blue-400 to-indigo-500'
    },
    {
        id: 3,
        code: 'FOODHUBNOW20',
        title: 'Weekend Feast',
        description: 'Flat 20% OFF on orders above ₹499.',
        discount: '20% OFF',
        expiry: 'Expires in 2 days',
        type: 'weekend',
        color: 'from-emerald-400 to-teal-500'
    }
];

export default function Coupons() {
    const [copiedCode, setCopiedCode] = useState(null);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Coupon code copied! 🎉');
        setTimeout(() => setCopiedCode(null), 3000);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-bold mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        EXCLUSIVE OFFERS
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black text-slate-900 mb-4"
                    >
                        Hungry for Savings? 🍕
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg"
                    >
                        Use these coupon codes at checkout to get the best deals on your favorite meals.
                    </motion.p>
                </div>

                {/* Coupons Grid */}
                <div className="space-y-6">
                    {demoCoupons.map((coupon, index) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="relative group bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            {/* Decorative Circle Cuts */}
                            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 -translate-y-1/2 z-10 shadow-inner" />
                            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 -translate-y-1/2 z-10 shadow-inner" />

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* Coupon Value Side */}
                                <div className={`w-full md:w-1/3 p-6 rounded-2xl bg-gradient-to-br ${coupon.color} text-white flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-1 opacity-20">
                                        <Ticket className="w-20 h-20 -rotate-12" />
                                    </div>
                                    <span className="text-3xl font-black mb-1">{coupon.discount}</span>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Discount</span>
                                </div>

                                {/* Content Side */}
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                            {coupon.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{coupon.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{coupon.description}</p>

                                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {coupon.expiry}
                                    </div>
                                </div>

                                {/* Redeem Side */}
                                <div className="md:border-l border-slate-100 md:pl-6 flex flex-col items-center gap-3">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coupon Code</div>
                                    <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                        <span className="px-4 py-2 font-black text-slate-800 tracking-widest uppercase">
                                            {coupon.code}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(coupon.code)}
                                            className="p-2 bg-white text-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                                        >
                                            {copiedCode === coupon.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toast.info('Add items to cart and apply this code at checkout!')}
                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                                    >
                                        Redeem Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4"
                >
                    <div className="p-3 rounded-2xl bg-white shadow-sm">
                        <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">How to use coupons?</h4>
                        <p className="text-blue-700/70 text-sm">Simply copy the code of your choice, add delicious food to your cart, and enter the code in the "Apply Coupon" section during checkout to see the magic happen!</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
