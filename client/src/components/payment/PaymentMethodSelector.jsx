import { useState } from 'react';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, walletBalance, orderAmount, onNewCardData, onBankSelect, onUpiIdChange }) => {
    const [expandedSection, setExpandedSection] = useState(null);

    // Get today's date for default expiry
    const now = new Date();
    const defaultExpiry = String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getFullYear()).slice(-2);

    const [newCard, setNewCard] = useState({ number: '', expiry: defaultExpiry, cvv: '', name: '' });
    const [selectedBank, setSelectedBank] = useState('');
    const [upiId, setUpiId] = useState('');
    const [saveCard, setSaveCard] = useState(false);
    const [saveUpi, setSaveUpi] = useState(false);

    const banks = [
        'HDFC Bank', 'ICICI Bank', 'State Bank of India',
        'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda'
    ];

    const handleSelect = (method, section) => {
        setExpandedSection(section);
        onMethodChange(method);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\D/g, '').slice(0, 16);
        return v.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
        return v;
    };

    const insufficientBalance = (walletBalance || 0) < orderAmount;

    // Helper to get display-friendly name for selected method
    const getMethodSummary = () => {
        switch (selectedMethod) {
            case 'vibepay_wallet': return { title: 'VibePay Wallet', detail: `Balance: $${(walletBalance || 0).toFixed(2)}` };
            case 'saved_card': return { title: 'Visa •••• 1840', detail: 'Credit Card' };
            case 'saved_upi': return { title: 'Union Bank ••••0491', detail: 'UPI' };
            case 'new_card': return { title: 'Credit/Debit Card', detail: newCard.number ? `•••• ${newCard.number.replace(/\s/g, '').slice(-4)}` : 'New Card' };
            case 'net_banking': return { title: 'Net Banking', detail: selectedBank || 'Bank selected' };
            case 'qr_upi': return { title: 'Scan & Pay', detail: 'UPI QR Code' };
            case 'other_upi': return { title: 'UPI Payment', detail: upiId || 'UPI ID entered' };
            case 'cod': return { title: 'Cash on Delivery', detail: 'Pay at doorstep' };
            default: return { title: 'Payment method', detail: '' };
        }
    };

    // Expose method summary to parent via a data attribute on the container
    const summary = getMethodSummary();

    return (
        <div className="payment-methods-container" data-method-title={summary.title} data-method-detail={summary.detail}>
            {/* 1. VibePay Wallet / Balance */}
            <div className={`pay-method-section ${expandedSection === 'wallet' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('vibepay_wallet', 'wallet')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'vibepay_wallet'}
                        onChange={() => handleSelect('vibepay_wallet', 'wallet')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">
                            <span style={{ color: '#8400ff', fontWeight: 800 }}>Vibe</span>Pay Wallet
                        </div>
                        <div className="pay-method-sub">
                            Balance: ${(walletBalance || 0).toFixed(2)}
                            {insufficientBalance && (
                                <span className="pay-insufficient"> — Insufficient balance</span>
                            )}
                        </div>
                    </div>
                </label>
                {expandedSection === 'wallet' && insufficientBalance && (
                    <div className="pay-method-body">
                        <div className="pay-info-banner warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            Insufficient balance. <a href="/vibepay" style={{ color: '#00d4ff', marginLeft: '4px' }}>Add money →</a>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Credit & Debit Cards */}
            <div className={`pay-method-section ${expandedSection === 'saved_card' ? 'expanded' : ''}`}>
                <div className="pay-section-heading">CREDIT & DEBIT CARDS</div>
                <label className="pay-method-header" onClick={() => handleSelect('saved_card', 'saved_card')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'saved_card'}
                        onChange={() => handleSelect('saved_card', 'saved_card')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">Visa ending in 1840</div>
                        <div className="pay-method-sub">Likith Bhaskar</div>
                    </div>
                    <div className="card-brands">
                        <span className="card-brand visa">VISA</span>
                    </div>
                </label>
                {expandedSection === 'saved_card' && (
                    <div className="pay-method-body">
                        <label className="save-checkbox">
                            <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                            <span>Save this card for faster checkout next time</span>
                        </label>
                    </div>
                )}
            </div>

            {/* 3. UPI */}
            <div className={`pay-method-section ${expandedSection === 'saved_upi' ? 'expanded' : ''}`}>
                <div className="pay-section-heading">UPI</div>
                <label className="pay-method-header" onClick={() => handleSelect('saved_upi', 'saved_upi')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'saved_upi'}
                        onChange={() => handleSelect('saved_upi', 'saved_upi')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">
                            Union Bank of India ····0491 <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 400, marginLeft: '4px' }}>UPI</span>
                        </div>
                    </div>
                </label>
                {expandedSection === 'saved_upi' && (
                    <div className="pay-method-body">
                        <label className="save-checkbox">
                            <input type="checkbox" checked={saveUpi} onChange={e => setSaveUpi(e.target.checked)} />
                            <span>Save this UPI ID for future payments</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Section Heading: Another payment method */}
            <div className="pay-section-divider">Another payment method</div>

            {/* 4. Add New Credit / Debit Card */}
            <div className={`pay-method-section ${expandedSection === 'new_card' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('new_card', 'new_card')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'new_card'}
                        onChange={() => handleSelect('new_card', 'new_card')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">Credit or Debit Card</div>
                        <div className="pay-method-sub">Add a new card</div>
                    </div>
                    <div className="card-brands">
                        <span className="card-brand visa">VISA</span>
                        <span className="card-brand mc">MC</span>
                        <span className="card-brand amex">AMEX</span>
                        <span className="card-brand rupay">RuPay</span>
                    </div>
                </label>
                {expandedSection === 'new_card' && (
                    <div className="pay-method-body">
                        <div className="card-form">
                            <div className="card-form-row">
                                <label className="card-label">Card Number</label>
                                <input
                                    className="input-field" placeholder="1234 5678 9012 3456"
                                    value={newCard.number}
                                    onChange={e => {
                                        const c = { ...newCard, number: formatCardNumber(e.target.value) };
                                        setNewCard(c); onNewCardData?.(c);
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label className="card-label">Valid Thru</label>
                                    <input
                                        className="input-field" placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChange={e => {
                                            const c = { ...newCard, expiry: formatExpiry(e.target.value) };
                                            setNewCard(c); onNewCardData?.(c);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="card-label">CVV</label>
                                    <input
                                        className="input-field" placeholder="•••" type="password"
                                        inputMode="numeric" maxLength={3}
                                        value={newCard.cvv}
                                        onChange={e => {
                                            const c = { ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) };
                                            setNewCard(c); onNewCardData?.(c);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="card-form-row">
                                <label className="card-label">Cardholder Name</label>
                                <input
                                    className="input-field" placeholder="Name on card"
                                    value={newCard.name}
                                    onChange={e => {
                                        const c = { ...newCard, name: e.target.value };
                                        setNewCard(c); onNewCardData?.(c);
                                    }}
                                />
                            </div>
                            <label className="save-checkbox" style={{ marginTop: '0.5rem' }}>
                                <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                                <span>Save this card securely for future payments</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Net Banking */}
            <div className={`pay-method-section ${expandedSection === 'net_banking' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('net_banking', 'net_banking')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'net_banking'}
                        onChange={() => handleSelect('net_banking', 'net_banking')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">Net Banking</div>
                        <div className="pay-method-sub">All major banks supported</div>
                    </div>
                </label>
                {expandedSection === 'net_banking' && (
                    <div className="pay-method-body">
                        <select
                            className="input-field"
                            value={selectedBank}
                            onChange={e => { setSelectedBank(e.target.value); onBankSelect?.(e.target.value); }}
                            style={{ marginBottom: 0 }}
                        >
                            <option value="">Choose a Bank</option>
                            {banks.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* 6. Scan & Pay with UPI (QR) */}
            <div className={`pay-method-section ${expandedSection === 'qr_upi' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('qr_upi', 'qr_upi')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'qr_upi'}
                        onChange={() => handleSelect('qr_upi', 'qr_upi')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">
                            Scan & Pay with UPI
                        </div>
                        <div className="pay-method-sub">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                            </svg>
                            You will need to scan the QR code on the payment page
                        </div>
                    </div>
                </label>
            </div>

            {/* 7. Other UPI Apps */}
            <div className={`pay-method-section ${expandedSection === 'other_upi' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('other_upi', 'other_upi')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'other_upi'}
                        onChange={() => handleSelect('other_upi', 'other_upi')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">Other UPI Apps</div>
                        <div className="pay-method-sub">Pay using any UPI app</div>
                    </div>
                </label>
                {expandedSection === 'other_upi' && (
                    <div className="pay-method-body">
                        <label className="card-label">Enter UPI ID</label>
                        <input
                            className="input-field" placeholder="yourname@upi"
                            value={upiId}
                            onChange={e => { setUpiId(e.target.value); onUpiIdChange?.(e.target.value); }}
                            style={{ marginBottom: '0.5rem' }}
                        />
                        <label className="save-checkbox">
                            <input type="checkbox" checked={saveUpi} onChange={e => setSaveUpi(e.target.checked)} />
                            <span>Save this UPI ID for future payments</span>
                        </label>
                    </div>
                )}
            </div>

            {/* 8. Cash on Delivery */}
            <div className={`pay-method-section ${expandedSection === 'cod' ? 'expanded' : ''}`}>
                <label className="pay-method-header" onClick={() => handleSelect('cod', 'cod')}>
                    <input
                        type="radio" className="radio-btn" name="paymethod"
                        checked={selectedMethod === 'cod'}
                        onChange={() => handleSelect('cod', 'cod')}
                    />
                    <div className="pay-method-info">
                        <div className="pay-method-title">Cash on Delivery / Pay on Delivery</div>
                        <div className="pay-method-sub">Cash, UPI and Cards accepted at delivery</div>
                    </div>
                </label>
            </div>
        </div>
    );
};

// Export the helper so Checkout can use it
export const getPaymentMethodSummary = (method, extras = {}) => {
    switch (method) {
        case 'vibepay_wallet': return { title: 'VibePay Wallet', detail: `Balance: $${(extras.walletBalance || 0).toFixed(2)}` };
        case 'saved_card': return { title: 'Visa •••• 1840', detail: 'Credit Card — Likith Bhaskar' };
        case 'saved_upi': return { title: 'Union Bank ••••0491', detail: 'UPI' };
        case 'new_card': return { title: 'Credit/Debit Card', detail: extras.cardLast4 ? `•••• ${extras.cardLast4}` : 'New Card' };
        case 'net_banking': return { title: 'Net Banking', detail: extras.bankName || 'Bank' };
        case 'qr_upi': return { title: 'Scan & Pay', detail: 'UPI QR Code' };
        case 'other_upi': return { title: 'UPI Payment', detail: extras.upiId || 'UPI ID' };
        case 'cod': return { title: 'Cash on Delivery', detail: 'Pay at doorstep' };
        default: return { title: 'Payment', detail: '' };
    }
};

export default PaymentMethodSelector;
