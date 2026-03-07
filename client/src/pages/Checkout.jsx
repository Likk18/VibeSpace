import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cart, addresses, addAddress, fetchProfile } = useProfile();

    // Check if we came from "Buy Now" (single product) or multiple items (from Cart/Wishlist)
    const passedProduct = location.state?.product;
    const passedItems = location.state?.items;
    
    // Determine checkout items
    let checkoutItems = [];
    if (passedProduct) {
        checkoutItems = [passedProduct];
    } else if (passedItems && passedItems.length > 0) {
        checkoutItems = passedItems;
    } else {
        checkoutItems = cart || []; // Default to cart if nothing passed
    }

    // State
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [currentSection, setCurrentSection] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Success Screen State
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Form State for new address
    const [newAddress, setNewAddress] = useState({
        name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home'
    });

    // Group checkout items by ID to handle quantities natively
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Countdown Redirect Effect
    useEffect(() => {
        if (orderPlaced) {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                navigate('/orders');
            }
        }
    }, [orderPlaced, countdown, navigate]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setIsProcessing(true);
            const addressToAdd = { ...newAddress };
            
            // If it's the first Home address or user expressly set it
            if (addresses.length === 0 && addressToAdd.tag === 'Home') {
                addressToAdd.is_default = true;
            }

            const apiResponse = await addAddress(addressToAdd);
            
            // Find the newly added address ID (the last one returned or by matching fields)
            const newlyAdded = apiResponse.data.addresses[apiResponse.data.addresses.length - 1];
            if (newlyAdded) {
                setSelectedAddressId(newlyAdded._id);
            }
            
            if (addressToAdd.tag === 'Home' || newlyAdded) {
                setCurrentSection(2); 
            }

            setIsAddressModalOpen(false);
            setNewAddress({ name: user?.name || '', street: '', area: '', city: '', state: '', pincode: '', tag: 'Home' });
        } catch (error) {
            console.error('Failed to save address', error);
            alert('Could not save address. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }
        
        setIsProcessing(true);
        try {
            const orderPayload = {
                items: uniqueCheckoutItems.map(item => {
                    return {
                        product: item._id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url,
                        quantity: item.checkoutQuantity
                    };
                }),
                total_amount: total,
                shipping_address: selectedAddress,
                payment_method: paymentMethod
            };

            await ordersAPI.createOrder(orderPayload);
            
            // Re-fetch profile to sync the cleared cart/wishlist from the database
            await fetchProfile();
            
            setOrderPlaced(true);
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Could not place order. Please try again later.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (checkoutItems.length === 0 && !isProcessing) {
        return (
            <div className="min-h-screen bg-[#020008] flex flex-col items-center justify-center p-4 text-center text-white">
                <h2 className="text-3xl font-display font-bold mb-6">Your checkout is empty</h2>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3">Explore VibeSpace</button>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#020008] flex flex-col items-center justify-center p-4 text-center text-white">
                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-in fade-in zoom-in duration-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">Order Placed Successfully!</h2>
                <p className="text-xl text-gray-400 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">Your items will be on their way soon.</p>
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 delay-500 fill-mode-both">
                    <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg className="animate-spin h-16 w-16 text-[#00d4ff] opacity-20 absolute" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold text-2xl z-10 text-[#00d4ff]">{countdown}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium tracking-wide mt-2 uppercase">Redirecting to your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Header */}
            <header className="checkout-header">
                <div className="w-32"></div>
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
                                        { id: 'upi', label: 'VibePay UPI', sub: 'Linked Bank Account ..5771' },
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
                                {uniqueCheckoutItems.map((item, idx) => {
                                    return (
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
                                    );
                                })}
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
