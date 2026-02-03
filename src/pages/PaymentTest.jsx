import { useState } from 'react';
import RazorpayPayment from '../components/RazorpayPayment';

const PaymentTest = () => {
    const [testAmount, setTestAmount] = useState(100);
    const [paymentStatus, setPaymentStatus] = useState('');

    const handlePaymentSuccess = (data) => {
        console.log('Payment Success:', data);
        setPaymentStatus('success');
        alert(`✅ Payment Successful!\nPayment ID: ${data.paymentId}\nOrder ID: ${data.orderId}`);
    };

    const handlePaymentFailure = (error) => {
        console.log('Payment Failed:', error);
        setPaymentStatus('failed');
        alert(`❌ Payment Failed!\nError: ${error}`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto 40px',
                textAlign: 'center',
                color: 'white',
            }}>
                <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>💳 Payment Gateway Test</h1>
                <p style={{ fontSize: '18px', opacity: 0.9 }}>Test Razorpay Integration</p>
            </div>

            {/* Payment Card */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                {/* Amount Input */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: '#333',
                    }}>
                        Enter Amount (₹)
                    </label>
                    <input
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(Number(e.target.value))}
                        min="1"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '18px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.3s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                </div>

                {/* Quick Amount Buttons */}
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Quick Select:</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[100, 250, 500, 1000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setTestAmount(amount)}
                                style={{
                                    padding: '8px 16px',
                                    border: testAmount === amount ? '2px solid #667eea' : '2px solid #e0e0e0',
                                    backgroundColor: testAmount === amount ? '#f0f4ff' : 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: testAmount === amount ? 'bold' : 'normal',
                                    color: testAmount === amount ? '#667eea' : '#666',
                                    transition: 'all 0.3s',
                                }}
                            >
                                ₹{amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666' }}>Subtotal:</span>
                        <span style={{ fontWeight: 'bold' }}>₹{testAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666' }}>Tax (0%):</span>
                        <span style={{ fontWeight: 'bold' }}>₹0</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '15px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total:</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>₹{testAmount}</span>
                    </div>
                </div>

                {/* Razorpay Payment Button */}
                <div style={{ marginBottom: '30px' }}>
                    <RazorpayPayment
                        amount={testAmount}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                    />
                </div>

                {/* Payment Status */}
                {paymentStatus && (
                    <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: paymentStatus === 'success' ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${paymentStatus === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        color: paymentStatus === 'success' ? '#155724' : '#721c24',
                        textAlign: 'center',
                    }}>
                        {paymentStatus === 'success' ? '✅ Payment Successful!' : '❌ Payment Failed!'}
                    </div>
                )}

                {/* Test Card Info */}
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '12px',
                    border: '1px solid #ffeaa7',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#856404' }}>
                        🧪 Test Card Details (For Testing)
                    </h3>
                    <div style={{ fontSize: '14px', color: '#856404', lineHeight: '1.8' }}>
                        <p style={{ margin: '5px 0' }}><strong>Card Number:</strong> 4111 1111 1111 1111</p>
                        <p style={{ margin: '5px 0' }}><strong>CVV:</strong> 123</p>
                        <p style={{ margin: '5px 0' }}><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
                        <p style={{ margin: '5px 0' }}><strong>Name:</strong> Any name</p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div style={{
                maxWidth: '600px',
                margin: '30px auto 0',
                textAlign: 'center',
                color: 'white',
                opacity: 0.8,
                fontSize: '14px',
            }}>
                <p>🔒 This is a TEST mode payment. No real money will be charged.</p>
                <p>Powered by Razorpay Payment Gateway</p>
            </div>
        </div>
    );
};

export default PaymentTest;
