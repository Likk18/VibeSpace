import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cartData } = useProfile();

    // Check if we came from "Buy Now" (single product) or regular Cart
    const buyNowProduct = location.state?.product;
    const checkoutItems = buyNowProduct ? [buyNowProduct] : (cartData || []);

    // State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [currentSection, setCurrentSection] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State for new address
    const [newAddress, setNewAddress] = useState({
        name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home'
    });

    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const delivery = subtotal > 500 ? 0 : 40;
    const total = subtotal + delivery;

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleAddAddress = (e) => {
        e.preventDefault();
        const id = Math.random().toString(36).substr(2, 9);
        const addressToAdd = { ...newAddress, id };

        const updatedAddresses = [...addresses, addressToAdd];
        setAddresses(updatedAddresses);

        // If it's tagged Home and no address is selected, or if it's the first Home address
        if (addressToAdd.tag === 'Home') {
            setSelectedAddressId(id);
            setCurrentSection(2); // Move to next section automatically if default set
        }

        setIsAddressModalOpen(false);
        setNewAddress({ name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home' });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        alert('Order placed successfully! Your VibeSpace identity is being synchronized.');
        navigate('/dashboard');
    };

    if (checkoutItems.length === 0 && !isProcessing) {
        return (
            <div className="min-h-screen bg-[#020008] flex flex-col items-center justify-center p-4 text-center text-white">
                <h2 className="text-3xl font-display font-bold mb-6">Your checkout is empty</h2>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3">Explore VibeSpace</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Header */}
            <header className="checkout-header">
                <div className="checkout-logo" onClick={() => navigate('/')}>VibeSpace</div>
                <div className="secure-tag">Secure Checkout</div>
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
                                    <span className="section-number">1</span> 选择配送地址 (Select Address)
                                </h3>

                                {addresses.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                className={`address-item ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <div className={`address-tag ${addr.tag === 'Home' ? 'home' : ''}`}>{addr.tag}</div>
                                                <div className="font-bold">{addr.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                                                </div>
                                            </div>
                                        ))}
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
                                    <span>Payment method ({paymentMethod.toUpperCase()})</span>
                                </div>
                                <button className="change-link" onClick={() => setCurrentSection(2)}>Change</button>
                            </div>
                        ) : (
                            <div className={`section-expanded ${currentSection < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
                                <h3 className="section-title mb-4">
                                    <span className="section-number">2</span> Payment method
                                </h3>

                                <div className="payment-box">
                                    {[
                                        { id: 'upi', label: 'Amazon Pay UPI', sub: 'Linked Bank Account ..5771' },
                                        { id: 'card', label: 'Credit or debit card', sub: 'All major cards accepted' },
                                        { id: 'cod', label: 'Cash on Delivery', sub: 'Pay at your doorstep' }
                                    ].map(opt => (
                                        <label key={opt.id} className="payment-option">
                                            <input
                                                type="radio"
                                                className="radio-btn"
                                                name="payment"
                                                checked={paymentMethod === opt.id}
                                                onChange={() => setPaymentMethod(opt.id)}
                                            />
                                            <div>
                                                <div className="font-bold">{opt.label}</div>
                                                <div className="text-xs text-gray-400">{opt.sub}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <button
                                    className="amazon-btn-primary mt-6 max-w-xs"
                                    onClick={() => setCurrentSection(3)}
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
                                {checkoutItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 border border-white/5 rounded-lg">
                                        <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                        <div>
                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                            <p className="text-[#00d4ff] font-bold mt-1">${item.price?.toFixed(2)}</p>
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
                            {isProcessing ? 'PLACING ORDER...' : 'Place your order'}
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
                                <span>${delivery.toFixed(2)}</span>
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
                            <input
                                className="input-field"
                                value={newAddress.name}
                                onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                required
                            />

                            <label className="text-xs font-bold text-gray-400">Street Address</label>
                            <input
                                className="input-field"
                                value={newAddress.street}
                                onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400">City</label>
                                    <input
                                        className="input-field"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Pincode</label>
                                    <input
                                        className="input-field"
                                        value={newAddress.pincode}
                                        onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <label className="text-xs font-bold text-gray-400">Address Category</label>
                            <select
                                className="input-field"
                                value={newAddress.tag}
                                onChange={e => setNewAddress({ ...newAddress, tag: e.target.value })}
                            >
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
        </div>
    );
};

export default Checkout;
