import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = ({ orderData }) => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate('/orders');
        }
    }, [countdown, navigate]);

    const methodNames = {
        'saved_card': 'Visa •••• 1840',
        'new_card': 'Credit/Debit Card',
        'saved_upi': 'UPI — Union Bank ••••0491',
        'other_upi': `UPI — ${orderData?.upiId || 'UPI Payment'}`,
        'net_banking': `Net Banking — ${orderData?.bankName || 'Bank'}`,
        'qr_upi': 'UPI QR Scan',
        'vibepay_wallet': 'VibePay Wallet',
        'cod': 'Cash on Delivery'
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#020008',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '2rem', color: '#fff'
        }}>
            {/* Animated checkmark */}
            <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                boxShadow: '0 0 40px rgba(34,197,94,0.2), 0 0 80px rgba(34,197,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem', animation: 'scaleIn 0.5s ease-out'
            }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 style={{
                fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem',
                background: 'linear-gradient(to right, #22c55e, #00d4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
                Payment Successful
            </h2>

            <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
                Your order has been placed successfully!
            </p>

            {/* Order Details Card */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Order ID</span>
                        <span style={{ fontWeight: 700, color: '#00d4ff' }}>{orderData?.order_id || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Transaction ID</span>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{orderData?.transaction_id || '—'}</span>
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem',
                        paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <span style={{ color: '#6b7280' }}>Amount Paid</span>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>${orderData?.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Payment Method</span>
                        <span style={{ fontWeight: 600 }}>{methodNames[orderData?.payment_method] || orderData?.payment_method}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Status</span>
                        <span style={{
                            background: 'rgba(132,0,255,0.15)', color: '#c084fc',
                            padding: '0.2rem 0.75rem', borderRadius: '999px',
                            fontSize: '0.75rem', fontWeight: 700
                        }}>
                            Demo Payment
                        </span>
                    </div>
                </div>
            </div>

            {/* Countdown */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '56px', height: '56px', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem'
                }}>
                    <svg style={{
                        position: 'absolute', animation: 'spin 2s linear infinite', opacity: 0.2
                    }} width="56" height="56" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#00d4ff" strokeWidth="4" opacity="0.25" />
                        <path fill="#00d4ff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '1.5rem', color: '#00d4ff' }}>{countdown}</span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Redirecting to your orders...
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
