import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VibePay.css';

const VibePay = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [amount, setAmount] = useState('1000');
    const [balance, setBalance] = useState(0.00);

    const handleAddMoney = () => {
        alert(`Request to add $${amount} received. Synchronization in progress...`);
        // Mocking balance update
        setBalance(prev => prev + parseFloat(amount));
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
                                <span className="text-sm text-gray-400 pb-1">Total balance</span>
                                <span className="text-4xl font-bold text-light">$ {balance.toFixed(2)}</span>
                            </div>

                            <div className="border-t border-white/5 pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Wallet</span>
                                    <span>$ 0.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Gift Cards</span>
                                    <span>$ 0.00</span>
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

                                <button onClick={handleAddMoney} className="btn-primary w-full md:w-auto px-10 py-3">
                                    Set-up wallet to add money
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
        </div>
    );
};

export default VibePay;
