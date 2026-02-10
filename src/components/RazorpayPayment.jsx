import { useState } from 'react';
import api from '../api';

const RazorpayPayment = ({ amount, onSuccess, onFailure }) => {
    const [loading, setLoading] = useState(false);

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Handle Payment
    const handlePayment = async () => {
        try {
            setLoading(true);

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Failed to load Razorpay. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // Create order on backend
            // Uses configured api client (auto-detects localhost vs prod)

            // Create order on backend
            const orderResponse = await api.post('/payment/create-order', {
                amount: amount,
                currency: 'INR',
            });

            const { orderId, amount: orderAmount, currency, key } = orderResponse.data;

            // Razorpay checkout options
            const options = {
                key: key, // Razorpay Key ID
                amount: orderAmount, // Amount in paise
                currency: currency,
                name: 'FoodHub Now',
                description: 'Food Order Payment',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // Verify payment on backend
                        const verifyResponse = await api.post(
                            '/payment/verify-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        );

                        if (verifyResponse.data.success) {
                            // Payment successful
                            if (onSuccess) {
                                onSuccess(verifyResponse.data);
                            }
                            alert('Payment Successful! 🎉');
                        } else {
                            // Payment verification failed
                            if (onFailure) {
                                onFailure('Payment verification failed');
                            }
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        if (onFailure) {
                            onFailure(error.message);
                        }
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999',
                },
                notes: {
                    address: 'Customer Address',
                },
                theme: {
                    color: '#FF6B35', // Your brand color
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        if (onFailure) {
                            onFailure('Payment cancelled by user');
                        }
                    },
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
            if (onFailure) {
                onFailure(error.message);
            }
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading || !amount}
            className="razorpay-payment-button"
            style={{
                backgroundColor: '#FF6B35',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
            }}
        >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
    );
};

export default RazorpayPayment;
