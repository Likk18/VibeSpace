import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { profileAPI } from '../services/api';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import OtpModal from '../components/payment/OtpModal';
import QrPaymentModal from '../components/payment/QrPaymentModal';
import NetBankingPage from '../components/payment/NetBankingPage';
import PaymentProcessing from '../components/payment/PaymentProcessing';
import './VibePay.css';

const VibePay = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { savedCards, savedUpis, saveCard, saveUpi } = useProfile();

    const balance = user?.vibepay_balance || 0;

    // Add Money state
    const [amount, setAmount] = useState('1000');
    const [paymentMethod, setPaymentMethod] = useState('new_card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Payment flow state
    const [paymentFlow, setPaymentFlow] = useState('idle'); // idle | otp | qr | netbanking | waiting | processing | success
    const [successMessage, setSuccessMessage] = useState('');

    // Payment method specific data
    const [newCardData, setNewCardData] = useState(null);
    const [selectedBank, setSelectedBank] = useState('');
    const [upiId, setUpiId] = useState('');
    const [wantSaveCard, setWantSaveCard] = useState(false);
    const [wantSaveUpi, setWantSaveUpi] = useState(false);

    const addAmount = parseFloat(amount) || 0;

    const addMoneyToWallet = async () => {
        try {
            const response = await profileAPI.addMoney(addAmount);
            const newBalance = response.data.data.vibepay_balance;
            updateUser({ vibepay_balance: newBalance });

            // Save card if opted in
            if (wantSaveCard && newCardData && paymentMethod === 'new_card') {
                const rawNum = newCardData.number.replace(/\s/g, '');
                try {
                    await saveCard({
                        last4: rawNum.slice(-4),
                        brand: rawNum.startsWith('4') ? 'Visa' : rawNum.startsWith('5') ? 'Mastercard' : 'Card',
                        holder_name: newCardData.name || ''
                    });
                } catch (e) { console.error('Card save failed', e); }
            }

            // Save UPI if opted in
            if (wantSaveUpi && upiId && paymentMethod === 'other_upi') {
                try {
                    await saveUpi({ upi_id: upiId, bank_name: 'UPI' });
                } catch (e) { console.error('UPI save failed', e); }
            }

            setSuccessMessage(`$${addAmount.toFixed(2)} added to your wallet!`);
            return true;
        } catch (err) {
            console.error('Add money failed:', err);
            alert(err.response?.data?.message || 'Failed to add money. Please try again.');
            return false;
        }
    };

    const handleAddMoney = async () => {
        if (addAmount <= 0) { alert('Please enter a valid amount'); return; }
        if (addAmount > 10000) { alert('Maximum add limit is $10,000'); return; }

        // Validation
        if (paymentMethod === 'net_banking' && !selectedBank) {
            alert('Please select a bank.');
            return;
        }
        if (paymentMethod === 'other_upi' && !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g. user@upi)');
            return;
        }

        setIsProcessing(true);

        try {
            switch (paymentMethod) {
                case 'saved_card':
                case 'new_card':
                    setPaymentFlow('otp');
                    break;

                case 'saved_upi':
                case 'other_upi': {
                    setPaymentFlow('waiting');
                    const delay = 3000 + Math.random() * 2000;
                    setTimeout(async () => {
                        const success = await addMoneyToWallet();
                        setPaymentFlow(success ? 'success' : 'idle');
                        setIsProcessing(false);
                    }, delay);
                    return;
                }

                case 'net_banking':
                    setPaymentFlow('netbanking');
                    break;

                case 'qr_upi':
                    setPaymentFlow('qr');
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong. Please try again.');
            setPaymentFlow('idle');
        }

        setIsProcessing(false);
    };

    // OTP success handler
    const handleOtpSuccess = async () => {
        setPaymentFlow('processing');
        const success = await addMoneyToWallet();
        setTimeout(() => {
            setPaymentFlow(success ? 'success' : 'idle');
        }, 1500);
    };

    // Net Banking success handler
    const handleNetBankingSuccess = async () => {
        const success = await addMoneyToWallet();
        setPaymentFlow(success ? 'success' : 'idle');
    };

    // QR success handler
    const handleQrSuccess = async () => {
        const success = await addMoneyToWallet();
        setPaymentFlow(success ? 'success' : 'idle');
    };

    // Close modal handler
    const handleCloseModal = () => {
        setPaymentFlow('idle');
        setIsProcessing(false);
    };

    // Success dismiss
    const handleSuccessDismiss = () => {
        setPaymentFlow('idle');
        setSuccessMessage('');
    };

    // Render modals
    const renderPaymentModals = () => {
        switch (paymentFlow) {
            case 'otp':
                return <OtpModal onSuccess={handleOtpSuccess} onClose={handleCloseModal} />;
            case 'qr':
                return (
                    <QrPaymentModal
                        orderId={`VP-${Date.now()}`}
                        amount={addAmount}
                        onSuccess={handleQrSuccess}
                        onClose={handleCloseModal}
                    />
                );
            case 'netbanking':
                return (
                    <NetBankingPage
                        bankName={selectedBank}
                        amount={addAmount}
                        onSuccess={handleNetBankingSuccess}
                        onClose={handleCloseModal}
                    />
                );
            case 'waiting':
            case 'processing':
                return <PaymentProcessing method={paymentMethod} amount={addAmount} />;
            case 'success':
                return (
                    <div className="modal-overlay" onClick={handleSuccessDismiss}>
                        <div className="modal-window" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '2.5rem 2rem' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'rgba(34,197,94,0.12)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#3D1F0D' }}>Money Added!</h3>
                            <p style={{ color: '#9c8070', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                {successMessage}
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B6347', marginBottom: '1.5rem' }}>
                                New Balance: ${(user?.vibepay_balance || 0).toFixed(2)}
                            </p>
                            <button className="btn-primary" onClick={handleSuccessDismiss} style={{ padding: '0.75rem 2.5rem' }}>
                                Done
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="vibepay-container">
            <header className="vibepay-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-light flex items-center gap-2">
                        <span className="text-primary font-display">Vibe</span>Pay Dashboard
                    </h1>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-primary">
                        Back to VibeSpace
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Balance Card */}
                        <div className="vibepay-card">
                            <h2 className="text-xl font-bold mb-6">VibePay balance</h2>
                            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-8">
                                <span className="text-sm text-gray-500 pb-1">Total balance</span>
                                <span className="text-4xl font-display font-bold text-dark">$ {balance.toFixed(2)}</span>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(139,99,71,0.1)' }} className="pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Wallet</span>
                                    <span className="font-semibold text-dark">$ {balance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Gift Cards</span>
                                    <span className="font-semibold text-dark">$ 0.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Money Card */}
                        <div className="vibepay-card">
                            <h3 className="text-lg font-bold mb-6">Add money to Wallet</h3>
                            <div className="space-y-6">
                                <div className="max-w-xs">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Enter Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
                                        <input
                                            type="number"
                                            className="vibepay-input text-2xl pl-10"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {['500', '1000', '1500'].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${amount === val
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            + ${val}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    You can add up to $10,000.00
                                </p>

                                {/* Payment Method Selector */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Select Payment Method</label>
                                    <PaymentMethodSelector
                                        selectedMethod={paymentMethod}
                                        onMethodChange={setPaymentMethod}
                                        walletBalance={0}
                                        orderAmount={addAmount}
                                        onNewCardData={setNewCardData}
                                        onBankSelect={setSelectedBank}
                                        onUpiIdChange={setUpiId}
                                        savedCards={savedCards}
                                        savedUpis={savedUpis}
                                        onSaveCardToggle={setWantSaveCard}
                                        onSaveUpiToggle={setWantSaveUpi}
                                        hideWallet={true}
                                        hideCod={true}
                                    />
                                </div>

                                <button
                                    onClick={handleAddMoney}
                                    disabled={isProcessing || addAmount <= 0}
                                    className="btn-primary w-full md:w-auto px-10 py-3"
                                >
                                    {isProcessing ? 'Processing...' : `Add $${addAmount > 0 ? addAmount.toFixed(2) : '0.00'} to Wallet`}
                                </button>
                            </div>
                        </div>

                        {/* Rewards Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="vibepay-reward-card">
                                <div className="reward-icon">💎</div>
                                <div>
                                    <div className="font-bold">Earn $10 back</div>
                                    <div className="text-xs text-gray-400">using any vibe payment</div>
                                    <div className="text-[10px] mt-1 text-gray-500">Min Order: $250</div>
                                </div>
                            </div>
                            <div className="vibepay-reward-card">
                                <div className="reward-icon">✨</div>
                                <div>
                                    <div className="font-bold">Scratch Card Rewards</div>
                                    <div className="text-xs text-gray-400">Win offers from top curated brands</div>
                                    <div className="text-[10px] mt-1 text-gray-500">Authenticated by VibeSpace</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <div className="vibepay-card">
                            <h3 className="font-bold mb-4">Do more with VibePay</h3>
                            <ul className="space-y-4">
                                <li className="vibepay-link-item">
                                    <span>Add Gift Card to Balance</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </li>
                                <li className="vibepay-link-item">
                                    <span>Add Cash to balance</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </li>
                            </ul>
                        </div>

                        <div className="vibepay-card">
                            <li className="vibepay-link-item !p-0">
                                <span className="font-bold">Transaction history</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </li>
                        </div>

                        <div className="vibepay-card">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Manage</h3>
                            <button onClick={() => navigate('/settings')} className="vibepay-link-item !p-0 w-full text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <span className="font-bold">Account Settings</span>
                                </div>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-600 border-t border-white/5 pt-8">
                    <div className="flex justify-center gap-6 mb-4">
                        <span className="hover:text-primary cursor-pointer">Help & FAQs</span>
                        <span className="hover:text-primary cursor-pointer">Conditions of Use</span>
                    </div>
                    <p>&copy; 2026 VibeSpace Technologies. All rights reserved.</p>
                </div>
            </main>

            {/* Payment Flow Modals */}
            {renderPaymentModals()}
        </div>
    );
};

export default VibePay;
