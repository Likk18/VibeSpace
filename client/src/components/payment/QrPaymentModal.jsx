import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ordersAPI } from '../../services/api';

const QrPaymentModal = ({ orderId, amount, onSuccess, onClose }) => {
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('scanning'); // scanning | verifying | success
    const [timeLeft, setTimeLeft] = useState(5);
    const pollRef = useRef(null);

    const qrUrl = `${window.location.origin}/api/orders/scan/${orderId}`;

    // Generate QR code
    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, qrUrl, {
                width: 220,
                margin: 2,
                color: { dark: '#ffffff', light: '#00000000' }
            });
        }
    }, [qrUrl]);

    // Poll for QR scan status
    useEffect(() => {
        if (status !== 'scanning') return;

        pollRef.current = setInterval(async () => {
            try {
                const res = await ordersAPI.checkQrStatus(orderId);
                if (res.data.data.qr_scanned) {
                    setStatus('verifying');
                    clearInterval(pollRef.current);
                }
            } catch (err) {
                console.error('QR poll error:', err);
            }
        }, 2000);

        return () => clearInterval(pollRef.current);
    }, [orderId, status]);

    // Countdown after QR scan detected
    useEffect(() => {
        if (status !== 'verifying') return;

        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onSuccess();
        }
    }, [status, timeLeft, onSuccess]);

    const handleSimulateScan = async () => {
        // Directly hit the scan endpoint via a fetch (simulates phone scan)
        try {
            await fetch(`${window.location.origin}/api/orders/scan/${orderId}`);
        } catch (e) {
            // CORS might block, but the server will still process it
        }
        setStatus('verifying');
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
