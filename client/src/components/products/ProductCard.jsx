import { Link } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';

const ProductCard = ({ product, showMatchScore = false }) => {
    const { addToWishlist, wishlist, addToCart, cart } = useProfile();

    // Check if the current product is in the wishlist
    const isSaved = wishlist && wishlist.some(item =>
        item.product === product._id || (item.product && item.product._id === product._id)
    );

    const isInCart = cart && cart.some(id => id === product._id || (id && id._id === product._id));

    return (
        <Link
            to={`/product/${product._id}`}
            className="card card-hover group"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-surface">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Match Score Badge */}
                {showMatchScore && product.matchScore > 0 && (
                    <div className="absolute top-3 right-3">
                        <div className="match-badge">
                            {product.matchScore >= 8 ? '✨ Perfect Match' : '✓ Good Match'}
                        </div>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        const folder = window.prompt("Enter a folder name (e.g. 'Living Room'), or leave blank for 'General':") ?? 'General';
                        await addToWishlist(product._id, folder || 'General');
                        alert(`Saved to ${folder || 'General'} wishlist!`);
                    }}
                    className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <svg
                        className={`w-5 h-5 transition-colors ${isSaved ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>

                {/* Cart Button */}
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        await addToCart(product._id);
                        alert('Added to Cart!');
                    }}
                    className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-primary/90 z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-gray-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                {/* Style Tags */}
                {product.style_tags && product.style_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {product.style_tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="style-chip text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-100">
                        ${product.price.toFixed(2)}
                    </span>

                    {product.rating > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-400">
                                {product.rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
