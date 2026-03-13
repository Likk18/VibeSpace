import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import ProductCard from '../components/products/ProductCard';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlist, removeFromWishlist } = useProfile();
    const [activeFolder, setActiveFolder] = useState(null);

    // Group items by folder
    const folders = useMemo(() => {
        if (!wishlist) return {};
        return wishlist.reduce((acc, item) => {
            const folderName = item.folder || 'General';
            if (!acc[folderName]) acc[folderName] = [];
            const productData = item.product;
            if (productData && typeof productData === 'object') {
                acc[folderName].push(productData);
            }
            return acc;
        }, {});
    }, [wishlist]);

    const folderNames = Object.keys(folders);
    const currentFolder = activeFolder || folderNames[0] || null;

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-24 px-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ background: 'rgba(139,99,71,0.1)' }}>
                        <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-dark mb-3">Your Wishlist is Empty</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Save your favourite pieces here to build your perfect space, one vibe at a time.
                    </p>
                    <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H7m6-6l-6 6 6 6" />
                        </svg>
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-display font-bold text-dark mb-1">Your Wishlist</h1>
                    <p className="text-gray-500">{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'} across {folderNames.length} {folderNames.length === 1 ? 'folder' : 'folders'}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar: Folder Tabs */}
                    <aside className="lg:w-56 flex-shrink-0">
                        <div className="sticky top-24 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-2">Folders</p>
                            {folderNames.map(name => (
                                <button
                                    key={name}
                                    onClick={() => setActiveFolder(name)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        currentFolder === name
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        {name}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        currentFolder === name ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                    }`}>
                                        {folders[name].length}
                                    </span>
                                </button>
                            ))}

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                                <button
                                    onClick={() => navigate('/checkout', { state: { items: wishlist } })}
                                    className="w-full btn-primary text-sm py-2.5 text-center"
                                >
                                    Checkout All
                                </button>
                                <Link
                                    to="/dashboard"
                                    className="w-full block text-center text-sm text-primary hover:text-primary/80 font-medium py-2 transition-colors"
                                >
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Main: Products Grid */}
                    <main className="flex-1">
                        {currentFolder && folders[currentFolder] && (
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <h2 className="text-xl font-display font-bold text-dark">{currentFolder}</h2>
                                    <span className="text-sm text-gray-400 ml-1">— {folders[currentFolder].length} items</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {folders[currentFolder].map((product) => (
                                        <div key={product._id} className="relative group/item">
                                            <ProductCard product={product} />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeFromWishlist(product._id);
                                                }}
                                                title="Remove from wishlist"
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-500 text-gray-400 z-20 border border-gray-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
