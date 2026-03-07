import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import OtpModal from '../components/payment/OtpModal';
import QrPaymentModal from '../components/payment/QrPaymentModal';
import NetBankingPage from '../components/payment/NetBankingPage';
import PaymentProcessing from '../components/payment/PaymentProcessing';
import PaymentSuccess from '../components/payment/PaymentSuccess';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cart, addresses, addAddress, fetchProfile } = useProfile();

    // Check if we came from "Buy Now" (single product) or multiple items
    const passedProduct = location.state?.product;
    const passedItems = location.state?.items;
    
    let checkoutItems = [];
    if (passedProduct) {
        checkoutItems = [passedProduct];
    } else if (passedItems && passedItems.length > 0) {
        checkoutItems = passedItems;
    } else {
        checkoutItems = cart || [];
    }

    // Core State
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [currentSection, setCurrentSection] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('saved_card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Payment Flow State
    const [paymentFlow, setPaymentFlow] = useState('idle'); // idle | processing | otp | qr | netbanking | waiting | success
    const [orderResult, setOrderResult] = useState(null);

    // Payment method specific data
    const [newCardData, setNewCardData] = useState(null);
    const [selectedBank, setSelectedBank] = useState('');
    const [upiId, setUpiId] = useState('');

    // Form State for new address
    const [newAddress, setNewAddress] = useState({
        name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home'
    });

    // Group checkout items by ID
    const groupedItemsMap = checkoutItems.reduce((acc, item) => {
        const prod = item.product || item;
        const id = prod._id || prod.id;
        if (!acc[id]) {
            acc[id] = { ...prod, checkoutQuantity: item.quantity || 1 };
        } else {
            acc[id].checkoutQuantity += item.quantity || 1;
        }
        return acc;
    }, {});
    const uniqueCheckoutItems = Object.values(groupedItemsMap);

    const subtotal = uniqueCheckoutItems.reduce((sum, item) => {
        return sum + ((item.price || 0) * item.checkoutQuantity);
    }, 0);
    const delivery = subtotal > 500 ? 0 : 40;
    const total = subtotal + delivery;

    const selectedAddress = addresses.find(a => a._id === selectedAddressId || a.id === selectedAddressId);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setIsProcessing(true);
            const addressToAdd = { ...newAddress };
            if (addresses.length === 0 && addressToAdd.tag === 'Home') {
                addressToAdd.is_default = true;
            }
            const apiResponse = await addAddress(addressToAdd);
            const newlyAdded = apiResponse.data.addresses[apiResponse.data.addresses.length - 1];
            if (newlyAdded) setSelectedAddressId(newlyAdded._id);
            if (addressToAdd.tag === 'Home' || newlyAdded) setCurrentSection(2);
            setIsAddressModalOpen(false);
            setNewAddress({ name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home' });
        } catch (error) {
            console.error('Failed to save address', error);
            alert('Could not save address. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const createOrder = async () => {
        const orderPayload = {
            items: uniqueCheckoutItems.map(item => ({
                product: item._id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                quantity: item.checkoutQuantity
            })),
            total_amount: total,
            shipping_address: selectedAddress,
            payment_method: paymentMethod
        };

        const response = await ordersAPI.createOrder(orderPayload);
        await fetchProfile();
        return response.data.data;
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) { alert('Please select a delivery address'); return; }

        // Validation
        if (paymentMethod === 'vibepay_wallet' && (user?.vibepay_balance || 0) < total) {
            alert('Insufficient wallet balance. Please add money first.');
            return;
        }
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
            // Determine flow based on payment method
            switch (paymentMethod) {
                case 'saved_card':
                case 'new_card':
                    setPaymentFlow('otp');
                    break;

                case 'saved_upi':
                case 'other_upi': {
                    setPaymentFlow('waiting');
                    // Simulate 4-6 second UPI wait
                    const delay = 4000 + Math.random() * 2000;
                    setTimeout(async () => {
                        try {
                            const order = await createOrder();
                            setOrderResult({
                                ...order,
                                payment_method: paymentMethod,
                                upiId: upiId
                            });
                            setPaymentFlow('success');
                        } catch (err) {
                            console.error('Order failed:', err);
                            alert('Payment failed. Please try again.');
                            setPaymentFlow('idle');
                        }
                        setIsProcessing(false);
                    }, delay);
                    return; // Don't setIsProcessing(false) yet
                }

                case 'net_banking':
                    setPaymentFlow('netbanking');
                    break;

                case 'qr_upi': {
                    // Create order first, then show QR
                    try {
                        const order = await createOrder();
                        setOrderResult({
                            ...order,
                            payment_method: paymentMethod
                        });
                        setPaymentFlow('qr');
                    } catch (err) {
                        console.error('Order failed:', err);
                        alert('Failed to create order. Please try again.');
                        setPaymentFlow('idle');
                    }
                    setIsProcessing(false);
                    return;
                }

                case 'vibepay_wallet':
                case 'cod': {
                    // Immediate order creation
                    try {
                        const order = await createOrder();
                        setOrderResult({
                            ...order,
                            payment_method: paymentMethod
                        });
                        setPaymentFlow('success');
                    } catch (err) {
                        console.error('Order failed:', err);
                        alert(err.response?.data?.message || 'Payment failed. Please try again.');
                        setPaymentFlow('idle');
                    }
                    break;
                }

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
        try {
            const order = await createOrder();
            setOrderResult({
                ...order,
                payment_method: paymentMethod
            });
            setTimeout(() => setPaymentFlow('success'), 1500);
        } catch (err) {
            console.error('Order failed:', err);
            alert('Payment failed. Please try again.');
            setPaymentFlow('idle');
        }
    };

    // Net Banking success handler
    const handleNetBankingSuccess = async () => {
        try {
            const order = await createOrder();
            setOrderResult({
                ...order,
                payment_method: paymentMethod,
                bankName: selectedBank
            });
            setPaymentFlow('success');
        } catch (err) {
            console.error('Order failed:', err);
            alert('Payment failed. Please try again.');
            setPaymentFlow('idle');
        }
    };

    // QR success handler
    const handleQrSuccess = () => {
        setPaymentFlow('success');
    };

    // Close modal handler
    const handleCloseModal = () => {
        setPaymentFlow('idle');
        setIsProcessing(false);
    };

    // Render modals based on payment flow state
    const renderPaymentModals = () => {
        switch (paymentFlow) {
            case 'otp':
                return <OtpModal onSuccess={handleOtpSuccess} onClose={handleCloseModal} />;
            case 'qr':
                return (
                    <QrPaymentModal
                        orderId={orderResult?.order_id}
                        amount={total}
                        onSuccess={handleQrSuccess}
                        onClose={handleCloseModal}
                    />
                );
            case 'netbanking':
                return (
                    <NetBankingPage
                        bankName={selectedBank}
                        amount={total}
                        onSuccess={handleNetBankingSuccess}
                        onClose={handleCloseModal}
                    />
                );
            case 'waiting':
            case 'processing':
                return <PaymentProcessing method={paymentMethod} amount={total} />;
            case 'success':
                return <PaymentSuccess orderData={orderResult} />;
            default:
                return null;
        }
    };

    // Empty cart
    if (checkoutItems.length === 0 && !isProcessing && paymentFlow === 'idle') {
        return (
            <div className="min-h-screen bg-[#020008] flex flex-col items-center justify-center p-4 text-center text-white">
                <h2 className="text-3xl font-display font-bold mb-6">Your checkout is empty</h2>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3">Explore VibeSpace</button>
            </div>
        );
    }

    // Success screen
    if (paymentFlow === 'success') {
        return <PaymentSuccess orderData={orderResult} />;
    }

    return (
        <div className="checkout-container">
            {/* Demo Banner */}
            <div className="demo-banner">
                <span>🎮</span>
                <span>Demo Payment System — No real payment will be processed</span>
            </div>

            {/* Header */}
            <header className="checkout-header">
                <div className="w-32"></div>
                <div className="secure-tag">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Secure Checkout
                </div>
                <div className="hidden md:block w-32"></div>
            </header>

            <main className="checkout-main">
                {/* Left Side: Steps */}
                <div className="checkout-steps">
                    {/* Section 1: Address */}
                    <div className="checkout-section">
                        {currentSection !== 1 && selectedAddress ? (
                            <div className="section-collapsed">
                                <div className="section-title">
                                    <span className="section-number">1</span>
                                    <div>
                                        <span>Delivering to {selectedAddress.name}</span>
                                        <div className="text-sm font-normal text-gray-400 mt-1">
                                            {selectedAddress.street}, {selectedAddress.city} {selectedAddress.pincode}
                                        </div>
                                    </div>
                                </div>
                                <button className="change-link" onClick={() => setCurrentSection(1)}>Change</button>
                            </div>
                        ) : (
                            <div className="section-expanded">
                                <h3 className="section-title mb-4">
                                    <span className="section-number">1</span> Select Address
                                </h3>
                                {addresses && addresses.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {addresses.map(addr => {
                                            const addrId = addr._id || addr.id;
                                            return (
                                                <div
                                                    key={addrId}
                                                    className={`address-item ${selectedAddressId === addrId ? 'selected' : ''}`}
                                                    onClick={() => setSelectedAddressId(addrId)}
                                                >
                                                    <div className={`address-tag ${addr.tag === 'Home' ? 'home' : ''}`}>{addr.tag}</div>
                                                    <div className="font-bold">{addr.name}</div>
                                                    <div className="text-sm text-gray-400">
                                                        {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button
                                            className="amazon-btn-primary mt-4 max-w-xs"
                                            disabled={!selectedAddressId}
                                            onClick={() => setCurrentSection(2)}
                                        >
                                            Use this address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-lg">
                                        <p className="text-gray-400 mb-4">No addresses saved yet.</p>
                                    </div>
                                )}
                                <button
                                    className="text-[#00d4ff] text-sm font-bold flex items-center gap-1 mt-2"
                                    onClick={() => setIsAddressModalOpen(true)}
                                >
                                    <span>+</span> Add a new address
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Payment */}
                    <div className="checkout-section">
                        {currentSection !== 2 && currentSection > 2 ? (
                            <div className="section-collapsed">
                                <div className="section-title">
                                    <span className="section-number">2</span>
                                    <span>Payment method selected</span>
                                </div>
                                <button className="change-link" onClick={() => setCurrentSection(2)}>Change</button>
                            </div>
                        ) : (
                            <div className={`section-expanded ${currentSection < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
                                <h3 className="section-title mb-4">
                                    <span className="section-number">2</span> Payment method
                                </h3>
                                <PaymentMethodSelector
                                    selectedMethod={paymentMethod}
                                    onMethodChange={setPaymentMethod}
                                    walletBalance={user?.vibepay_balance || 0}
                                    orderAmount={total}
                                    onNewCardData={setNewCardData}
                                    onBankSelect={setSelectedBank}
                                    onUpiIdChange={setUpiId}
                                />
                                <button
                                    className="amazon-btn-primary mt-6 max-w-xs"
                                    onClick={() => setCurrentSection(3)}
                                    disabled={
                                        (paymentMethod === 'vibepay_wallet' && (user?.vibepay_balance || 0) < total)
                                    }
                                >
                                    Use this payment method
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Review */}
                    <div className="checkout-section">
                        <div className={`section-expanded ${currentSection < 3 ? 'opacity-40 pointer-events-none' : ''}`}>
                            <h3 className="section-title mb-4">
                                <span className="section-number">3</span> Review items and shipping
                            </h3>
                            <div className="space-y-4">
                                {uniqueCheckoutItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 border border-white/5 rounded-lg">
                                        <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                        <div>
                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-[#00d4ff] font-bold">${(item.price || 0).toFixed(2)}</p>
                                                <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">Qty: {item.checkoutQuantity}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Authenticated by VibeSpace</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="sidebar-summary">
                    <div className="summary-card">
                        <button
                            className="amazon-btn-primary mb-4"
                            disabled={currentSection < 3 || isProcessing}
                            onClick={handlePlaceOrder}
                        >
                            {isProcessing ? 'PROCESSING...' : 'Place your order'}
                        </button>

                        <p className="text-[10px] text-gray-500 text-center mb-4 leading-tight">
                            By placing your order, you agree to VibeSpace's
                            <span className="text-blue-400"> terms and conditions</span>.
                        </p>

                        <div className="space-y-2 mb-4 pt-4 border-t border-white/10">
                            <h4 className="font-bold text-sm mb-3">Order Summary</h4>
                            <div className="summary-row">
                                <span>Items:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery:</span>
                                <span>{delivery === 0 ? <span style={{ color: '#22c55e' }}>Free</span> : `$${delivery.toFixed(2)}`}</span>
                            </div>
                            <div className="summary-total">
                                <span>Order Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-3 rounded text-[10px] text-blue-400 font-medium">
                            <span className="cursor-pointer hover:underline">How are delivery costs calculated?</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-window">
                        <h3 className="text-xl font-bold mb-4">Enter a new delivery address</h3>
                        <form onSubmit={handleAddAddress}>
                            <label className="text-xs font-bold text-gray-400">Full Name</label>
                            <input className="input-field" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
                            <label className="text-xs font-bold text-gray-400">Street Address</label>
                            <input className="input-field" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400">City</label>
                                    <input className="input-field" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Pincode</label>
                                    <input className="input-field" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                </div>
                            </div>
                            <label className="text-xs font-bold text-gray-400">Address Category</label>
                            <select className="input-field" value={newAddress.tag} onChange={e => setNewAddress({ ...newAddress, tag: e.target.value })}>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="amazon-btn-primary">Add Address</button>
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="amazon-btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Flow Modals */}
            {renderPaymentModals()}
        </div>
    );
};

export default Checkout;
