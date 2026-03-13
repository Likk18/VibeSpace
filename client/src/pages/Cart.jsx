import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, addToCart } = useProfile();

    const calculateTotal = () => {
        if (!cart) return 0;
        return cart.reduce((total, product) => total + (product?.price || 0), 0).toFixed(2);
    };

    // Group items for display
    const groupedCartMap = (cart || []).reduce((acc, product) => {
        if (!product) return acc;
        const id = product._id;
        if (!acc[id]) {
            acc[id] = { ...product, cartQuantity: 1 };
        } else {
            acc[id].cartQuantity += 1;
        }
        return acc;
    }, {});
    const uniqueCartItems = Object.values(groupedCartMap);

    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-screen bg-background py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <svg className="w-24 h-24 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h1 className="text-3xl font-display font-bold mb-4 text-light">Your Cart is Empty</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Discover your perfect vibe in the shop!</p>
                    <Link to="/dashboard" className="btn-primary inline-flex items-center px-8 py-4 text-lg">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-display font-bold text-light">Your Cart ({cart.length})</h1>
                    <Link to="/dashboard" className="text-primary hover:text-primary/80 transition-colors">
                        ← Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {uniqueCartItems.map((product, index) => (
                            <div key={`${product._id}-${index}`} className="bg-surface rounded-xl p-4 flex gap-6 items-center border border-white/5 relative group">
                                <Link to={`/product/${product._id}`} className="w-24 h-24 flex-shrink-0 bg-background rounded-lg overflow-hidden block">
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </Link>
                                <div className="flex-grow">
                                    <Link to={`/product/${product._id}`} className="text-lg font-bold text-light hover:text-primary transition-colors line-clamp-1 block mb-1">
                                        {product.name}
                                    </Link>
                                    <p className="text-primary font-bold mb-3">${product.price?.toFixed(2) || '0.00'}</p>
                                    
                                    {/* Amazon-style UI Stepper */}
                                    <div className="inline-flex border border-white/20 rounded-md items-center">
                                        <button 
                                            onClick={() => removeFromCart(product._id)}
                                            className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                                            title={product.cartQuantity === 1 ? "Remove item" : "Decrease quantity"}
                                        >
                                            {product.cartQuantity === 1 ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                            )}
                                        </button>
                                        <span className="px-3 py-1 font-bold text-sm border-x border-white/20 select-none w-10 text-center">{product.cartQuantity}</span>
                                        <button 
                                            onClick={() => addToCart(product._id)}
                                            className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                                            title="Increase quantity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right pr-4">
                                    <p className="font-bold text-lg hidden sm:block">${(product.price * product.cartQuantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 border border-white/5 bg-surface/50 rounded-2xl p-6 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold font-display text-light mb-6 border-b border-white/10 pb-4">Order Summary</h2>
                        <div className="flex justify-between items-center mb-4 text-gray-300">
                            <span>Subtotal</span>
                            <span>${calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-gray-300">
                            <span>Shipping</span>
                            <span className="text-green-400">Free</span>
                        </div>
                        <div className="flex justify-between items-center mb-8 text-gray-300">
                            <span>Tax (Estimated)</span>
                            <span>${(parseFloat(calculateTotal()) * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-8 text-xl font-bold text-light border-t border-white/10 pt-4">
                            <span>Total</span>
                            <span>${(parseFloat(calculateTotal()) * 1.08).toFixed(2)}</span>
                        </div>
                        <button 
                            className="w-full btn-primary py-4 text-lg" 
                            onClick={() => navigate('/checkout', { state: { items: cart } })}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
