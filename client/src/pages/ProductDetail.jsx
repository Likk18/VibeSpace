import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import WishlistDropdown from '../components/products/WishlistDropdown';
import StyleChip from '../components/ui/StyleChip';
import ProductCard from '../components/products/ProductCard';
import { selectBackgrounds } from '../utils/backgroundSelector';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, addToCart, removeFromCart, cart, addToWishlist, wishlist } = useProfile();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [compositeImages, setCompositeImages] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [mainLoading, setMainLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            try {
                setMainLoading(true);
                setError(null);
                const res = await productsAPI.getProduct(id);
                setProduct(res.data.data.product);
            } catch (err) {
                console.error('Failed to load product:', err);
                setError(err.message);
            } finally {
                setMainLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    // Update composite images when product changes
    useEffect(() => {
        if (product) {
            setActiveImageIndex(0);
            if (product.rmbg_image && product.category) {
                selectBackgrounds(product.category, product.sub_category, product.style_tags?.[0] || 'minimalist', 3).then(bgs => {
                    setCompositeImages(bgs);
                });
            }
            
            // Fetch similar products
            if (product.style_tags?.length > 0) {
                productsAPI.search({}).then(res => {
                    setSimilarProducts(res.data.data.products.slice(0, 4));
                });
            }
        }
    }, [product]);

    if (mainLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">{error ? 'Error loading product' : 'Product not found'}</p>
                    <Link to="/dashboard" className="text-primary hover:underline mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const galleryItems = [
        { 
            type: 'original', 
            url: product.rmbg_image || product.image_url, 
            isTransparent: !!product.rmbg_image 
        },
        ...(product.rmbg_image ? compositeImages.map(bg => ({ 
            type: 'composite', 
            url: product.rmbg_image, 
            bgUrl: bg 
        })) : [])
    ];

    // Parse reviews for display
    const reviews = product.reviews || [];
    const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
        : product.rating || 0;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link to="/dashboard" className="text-primary hover:underline">
                        ← Back to Products
                    </Link>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Vertical Thumbnails */}
                        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide pb-4 md:pb-0">
                            {galleryItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                        activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-surface hover:border-white/20'
                                    }`}
                                >
                                    <div 
                                        className="w-full h-full relative bg-[#F9F8F6]" 
                                        style={item.bgUrl ? { backgroundImage: `url('${item.bgUrl}')`, backgroundSize: 'cover' } : {}}
                                    >
                                        <img 
                                            src={item.url} 
                                            alt={`Thumbnail ${idx}`} 
                                            className={`absolute inset-0 m-auto w-[85%] h-[85%] object-contain ${item.isTransparent ? '' : 'w-full h-full object-cover'}`} 
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Main View - Uniform Container */}
                        <div className="flex-1 bg-[#F9F8F6] rounded-2xl shadow-2xl overflow-hidden relative group aspect-square md:h-[600px]">
                            <div 
                                className="w-full h-full relative transition-all duration-700 animate-in fade-in zoom-in-95" 
                                style={galleryItems[activeImageIndex]?.bgUrl ? {
                                    backgroundImage: `url('${galleryItems[activeImageIndex].bgUrl}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                } : {}}
                            >
                                <img 
                                    src={galleryItems[activeImageIndex].url} 
                                    alt={product.name}
                                    className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 max-h-[80%] max-w-[85%] object-contain transition-all duration-500 group-hover:scale-105"
                                    style={{ 
                                        filter: galleryItems[activeImageIndex].type === 'composite' 
                                            ? 'drop-shadow(0 20px 30px rgba(0,0,0,0.25))' 
                                            : 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' 
                                    }}
                                />
                                
                                {galleryItems[activeImageIndex].type === 'composite' && (
                                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white">
                                        AI Predicted Style
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-4xl font-display font-bold mb-4">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="text-3xl font-bold text-primary mb-6">
                            ${product.price.toFixed(2)}
                        </div>

                        {/* Rating */}
                        {avgRating > 0 && (
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-400">
                                    {avgRating.toFixed(1)} ({reviews.length || product.review_count || 0} reviews)
                                </span>
                            </div>
                        )}

                        {/* Designer Info */}
                        {product.designer && (
                            <div className="mb-6 flex items-center space-x-3 text-gray-400">
                                <span>Designed by <strong className="text-white">{product.designer}</strong></span>
                            </div>
                        )}

                        {/* Style Tags */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Style:</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.style_tags.map((tag, index) => (
                                    <StyleChip key={index} style={tag} />
                                ))}
                            </div>
                        </div>

                        {/* Vibe Match */}
                        {profile && product.style_tags.some(tag =>
                            tag === profile.primary_style || tag === profile.secondary_style
                        ) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <p className="text-green-800 font-medium">
                                        ✨ This fits your {profile.style_label} vibe
                                    </p>
                                </div>
                            )}

                        {/* Description */}
                        {product.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-400">{product.description}</p>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.in_stock ? (
                                <span className="text-green-600 font-medium">✓ In Stock</span>
                            ) : (
                                <span className="text-red-600 font-medium">Out of Stock</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-6">
                            {(() => {
                                const quantityInCart = cart.filter(cid => cid === product._id || cid?._id === product._id).length;
                                
                                if (quantityInCart > 0) {
                                    return (
                                        <div className="flex-1 border border-primary rounded-lg flex items-center justify-between px-6 py-4 bg-primary/5">
                                            <button 
                                                onClick={async () => await removeFromCart(product._id)} 
                                                className="text-white hover:text-primary transition-colors focus:outline-none p-2"
                                            >
                                                {quantityInCart === 1 ? (
                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                ) : (
                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                )}
                                            </button>
                                            <span className="text-xl font-bold text-white">{quantityInCart}</span>
                                            <button 
                                                disabled={!product.in_stock}
                                                onClick={async () => await addToCart(product._id)} 
                                                className={`text-white hover:text-primary transition-colors focus:outline-none p-2 ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        disabled={!product.in_stock}
                                        onClick={async () => {
                                            await addToCart(product._id);
                                        }}
                                        className={`btn-primary flex-1 py-4 text-lg ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Add to Cart
                                    </button>
                                );
                            })()}

                            <button
                                disabled={!product.in_stock}
                                onClick={() => navigate('/checkout', { state: { product } })}
                                className={`bg-white text-black border border-gray-300 font-bold px-8 py-4 rounded-lg hover:bg-gray-50 flex-1 ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Buy Now
                            </button>

                            <div className="flex items-center">
                                <WishlistDropdown
                                    productId={product._id}
                                    onAdd={addToWishlist}
                                    wishlist={wishlist}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-display font-bold mb-8">
                            You Might Also Like
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {reviews.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-display font-bold">
                                Customer Reviews
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-400 font-medium">
                                    {avgRating.toFixed(1)} ({reviews.length} reviews)
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {reviews.slice(0, 10).map((review, idx) => (
                                <div key={review.id || idx} className="bg-surface rounded-xl p-5 border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(review.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500">{(review.rating || 0).toFixed(1)}</span>
                                        </div>
                                        {review.sentiment && (
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                review.sentiment === 'positive' 
                                                    ? 'bg-green-900/30 text-green-400 border border-green-800/30' 
                                                    : review.sentiment === 'negative' 
                                                        ? 'bg-red-900/30 text-red-400 border border-red-800/30' 
                                                        : 'bg-gray-800/30 text-gray-400 border border-gray-700/30'
                                            }`}>
                                                {review.sentiment}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{review.review}</p>
                                </div>
                            ))}
                        </div>

                        {reviews.length > 10 && (
                            <p className="text-center text-gray-500 mt-4 text-sm">
                                Showing 10 of {reviews.length} reviews
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
