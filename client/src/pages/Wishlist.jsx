import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import ProductCard from '../components/products/ProductCard';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlist, removeFromWishlist } = useProfile();

    // Group items by folder
    const folders = useMemo(() => {
        if (!wishlist) return {};
        return wishlist.reduce((acc, item) => {
            const folderName = item.folder || 'General';
            if (!acc[folderName]) {
                acc[folderName] = [];
            }
            // Ensure we have a valid product object
            const productData = item.product;
            if (productData && typeof productData === 'object') {
                acc[folderName].push(productData);
            }
            return acc;
        }, {});
    }, [wishlist]);

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-background py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <svg className="w-24 h-24 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h1 className="text-3xl font-display font-bold mb-4 text-light">Your Wishlist is Empty</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">Save your favorite items here to create your perfect space.</p>
                    <Link to="/dashboard" className="btn-primary inline-flex items-center px-8 py-4 text-lg">
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-display font-bold text-light">Your Wishlist ({wishlist.length})</h1>
                    <div className="flex space-x-4">
                        <button 
                            className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full font-bold transition-colors"
                            onClick={() => navigate('/checkout', { state: { items: wishlist } })}
                        >
                            Checkout Entire Wishlist
                        </button>
                        <Link to="/dashboard" className="btn-secondary transition-colors">
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="space-y-12">
                    {Object.entries(folders).map(([folderName, items]) => (
                        <div key={folderName} className="bg-surface/30 p-6 sm:p-8 rounded-2xl border border-white/5">
                            <h2 className="text-2xl font-bold font-display text-light mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {folderName} <span className="text-sm font-sans text-gray-500 ml-3">({items.length} items)</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map((product) => (
                                    <div key={product._id} className="relative group/wishlist">
                                        <ProductCard product={product} />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(product._id);
                                            }}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/wishlist:opacity-100 transition-opacity z-20 shadow-lg hover:bg-red-600"
                                            title="Remove from wishlist"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
