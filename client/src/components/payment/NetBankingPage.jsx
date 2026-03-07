import { useState } from 'react';

const NetBankingPage = ({ bankName, amount, onSuccess, onClose }) => {
    const [step, setStep] = useState('login'); // login | confirm | processing
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const bankLogos = {
        'HDFC Bank': { color: '#004c8f', initials: 'HDFC' },
        'ICICI Bank': { color: '#f58220', initials: 'ICICI' },
        'State Bank of India': { color: '#1d4f91', initials: 'SBI' },
        'Axis Bank': { color: '#97144d', initials: 'AXIS' },
        'Kotak Mahindra Bank': { color: '#ed1c24', initials: 'KMB' },
        'Bank of Baroda': { color: '#f58220', initials: 'BOB' }
    };

    const bank = bankLogos[bankName] || { color: '#6366f1', initials: bankName?.slice(0, 4) };

    const handleLogin = (e) => {
        e.preventDefault();
        setStep('confirm');
    };

    const handleConfirm = () => {
        setStep('processing');
        setTimeout(() => {
            onSuccess();
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div style={{
                background: '#0a0a0f', width: '100%', maxWidth: '500px',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden'
            }}>
                {/* Bank Header */}
                <div style={{
                    background: bank.color, padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.7rem', color: '#fff'
                        }}>
                            {bank.initials}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{bankName}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Net Banking — Secure Login</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {step === 'login' && (
                        <form onSubmit={handleLogin}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>
                                Customer ID / Username
                            </label>
                            <input
                                className="input-field"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your customer ID"
                                required
                                style={{ marginBottom: '1rem' }}
                            />

                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>
                                Password / IPIN
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                style={{ marginBottom: '1.5rem' }}
                            />

                            <button type="submit" className="amazon-btn-primary">
                                Login Securely
                            </button>
                            <button type="button" onClick={onClose} className="amazon-btn-secondary" style={{ marginTop: '0.75rem' }}>
                                Cancel & Return to Checkout
                            </button>
                        </form>
                    )}

                    {step === 'confirm' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'rgba(34,197,94,0.15)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                                </svg>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Confirm Payment</h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                You are about to pay
                            </p>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#9ca3af' }}>Merchant</span>
                                    <span style={{ fontWeight: 600 }}>VibeSpace Technologies</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#9ca3af' }}>Bank</span>
                                    <span style={{ fontWeight: 600 }}>{bankName}</span>
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '1.1rem', fontWeight: 700
                                }}>
                                    <span>Amount</span>
                                    <span style={{ color: '#00d4ff' }}>${amount?.toFixed(2)}</span>
                                </div>
                            </div>

                            <button className="amazon-btn-primary" onClick={handleConfirm}>
                                Confirm Payment
                            </button>
                            <button className="amazon-btn-secondary" onClick={onClose} style={{ marginTop: '0.75rem' }}>
                                Cancel
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div className="payment-spinner" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Processing Payment</h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                Please wait while we confirm with {bankName}...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetBankingPage;
