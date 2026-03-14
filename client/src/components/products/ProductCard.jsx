import { useNavigate, Link } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import WishlistDropdown from './WishlistDropdown';

const ProductCard = ({ product, showMatchScore = false }) => {
    const navigate = useNavigate();
    const { addToWishlist, wishlist, addToCart, cart } = useProfile();

    // Check if the current product is in the wishlist
    const isSaved = wishlist && wishlist.some(item =>
        item.product === product._id || (item.product && item.product._id === product._id)
    );

    const isInCart = cart && cart.some(id => id === product._id || (id && id._id === product._id));

    return (
        <Link
            to={`/product/${product._id}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-beige/10"
        >
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-surface group/image">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                />

                {/* VibeSpace-style Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {product.tags && product.tags.includes('new_arrival') && (
                        <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm shadow-sm w-max">New Arrival</span>
                    )}
                    {product.tags && product.tags.includes('bestseller') && (
                        <span className="bg-accent text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm shadow-sm w-max">Best Seller</span>
                    )}
                    {product.tags && product.tags.includes('limited') && (
                        <span className="bg-[#3D1F0D] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm shadow-sm w-max">Limited Time</span>
                    )}
                </div>

                {/* Match Score Badge */}
                {showMatchScore && product.matchScore > 0 && (
                    <div className="absolute top-3 right-3">
                        <div className="match-badge">
                            {product.matchScore >= 8 ? '✨ Perfect Match' : '✓ Good Match'}
                        </div>
                    </div>
                )}

                {/* Wishlist Dropdown */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <WishlistDropdown
                        productId={product._id}
                        onAdd={addToWishlist}
                        wishlist={wishlist}
                    />
                </div>

                {/* Hover Add to Cart Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover/image:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/80 to-transparent">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            await addToCart(product._id);
                        }}
                        className={`w-full py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors ${
                            isInCart 
                                ? 'bg-surface text-primary border border-primary' 
                                : 'bg-primary hover:bg-primary/90 text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {isInCart ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-dark font-display font-medium text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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

                <div className="flex flex-col mt-auto">
                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xl font-bold text-dark">
                            ${(product.price || 0).toFixed(2)}
                        </span>
                        {product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                                ${(product.original_price || 0).toFixed(2)}
                            </span>
                        )}
                    </div>
                    
                    {/* Rating Block */}
                    {product.rating > 0 && (
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-primary' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="text-xs text-primary/80 hover:text-primary hover:underline cursor-pointer ml-1">
                                {(product.rating_count || Math.floor(product.rating * 42)).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
