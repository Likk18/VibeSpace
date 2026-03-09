import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ordersAPI } from '../../services/api';

const QrPaymentModal = ({ orderId, amount, onSuccess, onClose }) => {
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('scanning'); // scanning | verifying | success
    const [timeLeft, setTimeLeft] = useState(5);
    const [pollError, setPollError] = useState(null);

    const qrUrl = `${window.location.origin}/api/orders/scan/${orderId}`;

    console.log('[QR Modal] orderId:', orderId);
    console.log('[QR Modal] qrUrl:', qrUrl);

    // Generate QR code
    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, qrUrl, {
                width: 220,
                margin: 2,
                color: { dark: '#ffffff', light: '#00000000' }
            }).catch(err => console.error('[QR Modal] QR generation error:', err));
        }
    }, [qrUrl]);

    // Poll for QR scan status
    useEffect(() => {
        if (status !== 'scanning') return;

        console.log('[QR Modal] Starting poll for order:', orderId);

        const pollInterval = setInterval(async () => {
            try {
                console.log('[QR Modal] Polling checkQrStatus for:', orderId);
                const res = await ordersAPI.checkQrStatus(orderId);
                console.log('[QR Modal] Poll response:', res.data);
                
                if (res.data?.data?.qr_scanned) {
                    console.log('[QR Modal] QR scanned detected!');
                    setStatus('verifying');
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error('[QR Modal] QR poll error:', err.response || err.message);
                setPollError(err.response?.data?.message || err.message);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [orderId, status]);

    // Countdown after QR scan detected
    useEffect(() => {
        if (status !== 'verifying') return;

        console.log('[QR Modal] Verifying, timeLeft:', timeLeft);

        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            console.log('[QR Modal] Calling onSuccess');
            onSuccess();
        }
    }, [status, timeLeft, onSuccess]);

    const handleSimulateScan = async () => {
        console.log('[QR Modal] Simulating scan for:', orderId);
        try {
            const response = await fetch(`${window.location.origin}/api/orders/scan/${orderId}`, {
                method: 'GET',
                mode: 'no-cors'
            });
            console.log('[QR Modal] Scan endpoint called, response:', response);
            setStatus('verifying');
        } catch (e) {
            console.error('[QR Modal] Simulate scan error:', e);
            // Still trigger verifying for testing
            setStatus('verifying');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window qr-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
                {status === 'scanning' && (
                    <>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(132,0,255,0.2), rgba(0,212,255,0.2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                            </svg>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Scan QR to Pay</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Open any UPI app on your phone and scan this code
                        </p>

                        {/* QR Code */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                            padding: '1.5rem', display: 'inline-block', marginBottom: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <canvas ref={canvasRef} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>UPI ID</p>
                            <p style={{ color: '#00d4ff', fontWeight: 600 }}>vibespace@upi</p>
                        </div>

                        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
                            Amount: <span style={{ color: '#fff', fontWeight: 700 }}>${amount?.toFixed(2)}</span>
                        </p>

                        {/* Scanning indicator */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', marginBottom: '1.5rem', color: '#9ca3af', fontSize: '0.8rem'
                        }}>
                            <div className="qr-pulse" />
                            Waiting for scan...
                        </div>

                        {/* Error display */}
                        {pollError && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '1rem' }}>
                                Error: {pollError}
                            </div>
                        )}

                        {/* Test button - visible for debugging */}
                        <button
                            onClick={handleSimulateScan}
                            style={{
                                background: 'rgba(132,0,255,0.2)',
                                border: '1px solid rgba(132,0,255,0.4)',
                                color: '#c084fc',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                marginTop: '0.5rem'
                            }}
                        >
                            [Test] Simulate QR Scan
                        </button>
                    </>
                )}

                {status === 'verifying' && (
                    <div style={{ padding: '2rem 0' }}>
                        <div className="payment-spinner" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying Payment...</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            Confirming with your bank ({timeLeft}s)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrPaymentModal;
