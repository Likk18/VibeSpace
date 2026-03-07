import { useState, useRef, useEffect } from 'react';

const OtpModal = ({ onSuccess, onClose }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [demoOtp, setDemoOtp] = useState(generateOtp());
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    function generateOtp() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    useEffect(() => {
        inputRefs[0].current?.focus();
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleSubmit = () => {
        const entered = otp.join('');
        if (entered.length < 4) {
            setError('Please enter all 4 digits');
            return;
        }
        if (entered === demoOtp) {
            onSuccess();
        } else {
            setError('Incorrect OTP. Please try again.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        }
    };

    const handleResend = () => {
        const newCode = generateOtp();
        setDemoOtp(newCode);
        setOtp(['', '', '', '']);
        setError('');
        inputRefs[0].current?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pasted.length === 4) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            inputRefs[3].current?.focus();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window otp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
                {/* Lock Icon */}
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(132,0,255,0.2), rgba(0,212,255,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>OTP Verification</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Enter the OTP sent to your registered phone
                </p>

                {/* Demo OTP Banner */}
                <div style={{
                    background: 'rgba(132,0,255,0.15)', border: '1px solid rgba(132,0,255,0.3)',
                    borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                    <span style={{ fontSize: '0.75rem', color: '#a78bfa' }}>🎮 Demo OTP:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.3em', color: '#c084fc' }}>
                        {demoOtp}
                    </span>
                </div>

                {/* OTP Input Boxes */}
                <div
                    className={shake ? 'otp-shake' : ''}
                    style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '1rem' }}
                    onPaste={handlePaste}
                >
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={inputRefs[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className="otp-input"
                        />
                    ))}
                </div>

                {error && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>
                )}

                <button className="amazon-btn-primary" onClick={handleSubmit} style={{ marginBottom: '0.75rem' }}>
                    Verify OTP
                </button>

                <button
                    onClick={handleResend}
                    style={{
                        background: 'none', border: 'none', color: '#00d4ff',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
                    }}
                >
                    Resend OTP
                </button>
            </div>
        </div>
    );
};

export default OtpModal;
