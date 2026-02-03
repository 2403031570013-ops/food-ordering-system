import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP+Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 max-w-md text-center"
                >
                    <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Password Reset Successful!
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link
                        to="/login"
                        className="btn-primary inline-block"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8">
                    {/* Back Button */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p className="text-slate-600">
                            {step === 1
                                ? 'Enter your email to receive a reset code'
                                : 'Enter the OTP sent to your email'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2 text-red-700"
                        >
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-orange-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="pl-10 input-field"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Sending OTP...' : 'Send Reset Code'}
                            </motion.button>
                        </form>
                    )}

                    {/* Step 2: OTP + New Password */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-700">
                                    📧 We've sent a 6-digit code to <strong>{email}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    6-Digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    className="input-field text-center text-2xl tracking-widest font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                    className="input-field"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Must be at least 6 characters
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Back
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </motion.button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
