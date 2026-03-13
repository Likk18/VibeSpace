const PaymentProcessing = ({ method, amount, onSimulateComplete }) => {
    return (
        <div className="modal-overlay">
            <div style={{
                background: '#0a0a0f', width: '100%', maxWidth: '420px',
                borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                padding: '3rem 2rem', textAlign: 'center'
            }}>
                <div className="payment-spinner" style={{ margin: '0 auto 2rem' }} />

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Processing Payment
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {method === 'saved_upi' || method === 'other_upi'
                        ? 'Waiting for approval in your UPI app...'
                        : 'Please wait while we process your payment...'}
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#6b7280' }}>Method</span>
                        <span style={{ fontWeight: 600 }}>{formatMethodName(method)}</span>
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Amount</span>
                        <span style={{ fontWeight: 700, color: '#00d4ff', fontSize: '1.1rem' }}>${amount?.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', color: '#6b7280', fontSize: '0.75rem'
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Secured by VibeSpace
                </div>
            </div>
        </div>
    );
};

function formatMethodName(method) {
    const names = {
        'saved_upi': 'UPI — Union Bank',
        'other_upi': 'UPI Payment',
        'saved_card': 'Visa •••• 1840',
        'new_card': 'Credit/Debit Card',
        'net_banking': 'Net Banking',
        'qr_upi': 'UPI QR Scan',
        'vibepay_wallet': 'VibePay Wallet',
        'cod': 'Cash on Delivery'
    };
    return names[method] || method;
}

export default PaymentProcessing;
