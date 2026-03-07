import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import WishlistDropdown from '../components/products/WishlistDropdown';
import StyleChip from '../components/ui/StyleChip';
import ProductCard from '../components/products/ProductCard';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, addToCart, removeFromCart, cart, addToWishlist, wishlist } = useProfile();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getProduct(id);
            setProduct(response.data.data.product);

            // Fetch similar products (same style tags)
            if (response.data.data.product.style_tags.length > 0) {
                const similarResponse = await productsAPI.search({
                    // In a real implementation, you'd have a "similar" endpoint
                });
                setSimilarProducts(similarResponse.data.data.products.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Product not found</p>
                    <Link to="/dashboard" className="text-primary hover:underline mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

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
                    {/* Image */}
                    <div className="bg-surface rounded-2xl shadow-lg overflow-hidden">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-auto object-cover"
                        />
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
                        {product.rating > 0 && (
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-400">
                                    {product.rating.toFixed(1)} ({product.review_count} reviews)
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
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-8">
                            You Might Also Like
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
