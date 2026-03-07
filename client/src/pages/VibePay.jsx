import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import OtpModal from '../components/payment/OtpModal';
import './VibePay.css';

const VibePay = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [amount, setAmount] = useState('1000');
    const [balance, setBalance] = useState(user?.vibepay_balance || 0);

    // Payment method state
    const [addStep, setAddStep] = useState('select'); // select | processing | otp | success
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [error, setError] = useState('');
    const [successAmount, setSuccessAmount] = useState(0);

    // Transactions (local log)
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        setBalance(user?.vibepay_balance || 0);
    }, [user?.vibepay_balance]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\D/g, '').slice(0, 16);
        return v.replace(/(\d{4})/g, '$1 ').trim();
    };

    const handleAddMoney = () => {
        const addAmt = parseFloat(amount);
        setError('');

        if (!addAmt || addAmt <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (addAmt > 10000) {
            setError('Maximum add limit is $10,000');
            return;
        }
        if ((balance + addAmt) > 10000) {
            setError(`Cannot exceed $10,000 wallet limit. Current balance: $${balance.toFixed(2)}`);
            return;
        }
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        // Card/UPI validation
        if (paymentMethod === 'card' && cardNumber.replace(/\s/g, '').length < 16) {
            setError('Please enter a valid 16-digit card number');
            return;
        }
        if (paymentMethod === 'upi' && !upiId.includes('@')) {
            setError('Please enter a valid UPI ID (e.g. user@upi)');
            return;
        }

        // Start payment flow
        if (paymentMethod === 'card') {
            setAddStep('otp');
        } else if (paymentMethod === 'upi') {
            setAddStep('processing');
            const delay = 3000 + Math.random() * 2000;
            setTimeout(() => processPayment(addAmt), delay);
        } else if (paymentMethod === 'netbanking') {
            setAddStep('processing');
            setTimeout(() => processPayment(addAmt), 2500);
        }
    };

    const processPayment = async (addAmt) => {
        try {
            const response = await profileAPI.addMoney(addAmt);
            const newBal = response.data.data.vibepay_balance;
            setBalance(newBal);
            setSuccessAmount(addAmt);
            updateUser({ vibepay_balance: newBal });

            // Log transaction
            setTransactions(prev => [{
                id: `TXN${Date.now().toString().slice(-8)}`,
                amount: addAmt,
                method: paymentMethod === 'card' ? `Card ••${cardNumber.replace(/\s/g, '').slice(-4)}` : paymentMethod === 'upi' ? upiId : 'Net Banking',
                date: new Date().toLocaleString(),
                type: 'credit'
            }, ...prev]);

            setAddStep('success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add money. Please try again.');
            setAddStep('select');
        }
    };

    const handleOtpSuccess = () => {
        const addAmt = parseFloat(amount);
        setAddStep('processing');
        setTimeout(() => processPayment(addAmt), 1500);
    };

    const resetForm = () => {
        setAddStep('select');
        setPaymentMethod('');
        setCardNumber('');
        setUpiId('');
        setAmount('1000');
        setError('');
    };

    return (
        <div className="vibepay-container">
            <header className="vibepay-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-light flex items-center gap-2">
                        <span className="text-primary font-display">Vibe</span>Pay
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
                            <h2 className="text-xl font-bold mb-6">VibePay Balance</h2>
                            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-8">
                                <span className="text-sm text-gray-400 pb-1">Available balance</span>
                                <span className="text-4xl font-bold text-light">
                                    $ {balance.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-white/5 pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Wallet</span>
                                    <span>$ {balance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Gift Cards</span>
                                    <span>$ 0.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Money Card */}
                        <div className="vibepay-card">
                            {addStep === 'select' && (
                                <>
                                    <h3 className="text-lg font-bold mb-6">Add Money to Wallet</h3>
                                    <div className="space-y-6">
                                        {/* Amount Input */}
                                        <div className="max-w-xs">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Enter Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    className="vibepay-input text-2xl pl-10"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    min="1"
                                                    max="10000"
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Amount Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {['250', '500', '1000', '2000', '5000'].map(val => (
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

                                        {/* Payment Method Selection */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Payment Method</label>
                                            <div className="space-y-2">
                                                {/* Card */}
                                                <label className={`vp-pay-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                                                    <input type="radio" name="vp-pay" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="radio-btn" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">Credit / Debit Card</div>
                                                        <div className="text-xs text-gray-500">Visa, Mastercard, RuPay</div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <span className="card-brand visa" style={{ fontSize: '0.5rem', padding: '0.15rem 0.3rem' }}>VISA</span>
                                                        <span className="card-brand mc" style={{ fontSize: '0.5rem', padding: '0.15rem 0.3rem' }}>MC</span>
                                                    </div>
                                                </label>
                                                {paymentMethod === 'card' && (
                                                    <div className="pl-8 pb-2">
                                                        <input
                                                            className="input-field"
                                                            placeholder="1234 5678 9012 3456"
                                                            value={cardNumber}
                                                            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                                            style={{ maxWidth: '300px' }}
                                                        />
                                                    </div>
                                                )}

                                                {/* UPI */}
                                                <label className={`vp-pay-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                                                    <input type="radio" name="vp-pay" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="radio-btn" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">UPI</div>
                                                        <div className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</div>
                                                    </div>
                                                </label>
                                                {paymentMethod === 'upi' && (
                                                    <div className="pl-8 pb-2">
                                                        <input
                                                            className="input-field"
                                                            placeholder="yourname@upi"
                                                            value={upiId}
                                                            onChange={e => setUpiId(e.target.value)}
                                                            style={{ maxWidth: '300px' }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Net Banking */}
                                                <label className={`vp-pay-option ${paymentMethod === 'netbanking' ? 'active' : ''}`}>
                                                    <input type="radio" name="vp-pay" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="radio-btn" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">Net Banking</div>
                                                        <div className="text-xs text-gray-500">HDFC, ICICI, SBI and more</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-sm font-medium">{error}</p>
                                        )}

                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Wallet limit: $10,000.00. Use wallet balance at checkout to get cashback rewards.
                                        </p>

                                        <button
                                            onClick={handleAddMoney}
                                            disabled={!paymentMethod || !amount}
                                            className="btn-primary w-full md:w-auto px-10 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add ${parseFloat(amount || 0).toFixed(2)} to Wallet
                                        </button>
                                    </div>
                                </>
                            )}

                            {addStep === 'processing' && (
                                <div className="text-center py-12">
                                    <div className="payment-spinner" style={{ margin: '0 auto 1.5rem', width: '48px', height: '48px' }} />
                                    <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                                    <p className="text-gray-400 text-sm">Verifying your {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'card' : 'net banking'} payment...</p>
                                </div>
                            )}

                            {addStep === 'success' && (
                                <div className="text-center py-8">
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: '50%',
                                        background: 'rgba(34,197,94,0.15)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 1.5rem', animation: 'scaleIn 0.5s ease-out'
                                    }}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1" style={{ color: '#22c55e' }}>Money Added Successfully!</h3>
                                    <p className="text-2xl font-bold mb-1">${successAmount.toFixed(2)}</p>
                                    <p className="text-gray-400 text-sm mb-6">
                                        New wallet balance: <span className="font-bold text-white">${balance.toFixed(2)}</span>
                                    </p>
                                    <button onClick={resetForm} className="btn-primary px-8 py-3">
                                        Add More Money
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Rewards Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="vibepay-reward-card">
                                <div className="reward-icon">💎</div>
                                <div>
                                    <div className="font-bold">Earn $10 back</div>
                                    <div className="text-xs text-gray-400">using any VibePay payment</div>
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
                        {/* Recent Transactions */}
                        <div className="vibepay-card">
                            <h3 className="font-bold mb-4">Recent Transactions</h3>
                            {transactions.length > 0 ? (
                                <ul className="space-y-3">
                                    {transactions.slice(0, 5).map((txn, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                            <div>
                                                <div className="font-medium">{txn.method}</div>
                                                <div className="text-xs text-gray-500">{txn.date}</div>
                                            </div>
                                            <span className="font-bold text-green-400">+${txn.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No transactions yet. Add money to get started.</p>
                            )}
                        </div>

                        <div className="vibepay-card">
                            <h3 className="font-bold mb-4">Do more with VibePay</h3>
                            <ul className="space-y-4">
                                <li className="vibepay-link-item">
                                    <span>Add Gift Card to Balance</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </li>
                                <li className="vibepay-link-item" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                                    <span>Transaction History</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </li>
                            </ul>
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

            {/* OTP modal for card payments */}
            {addStep === 'otp' && (
                <OtpModal
                    onSuccess={handleOtpSuccess}
                    onClose={() => setAddStep('select')}
                />
            )}
        </div>
    );
};

export default VibePay;
