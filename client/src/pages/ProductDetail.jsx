import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import StyleChip from '../components/ui/StyleChip';
import ProductCard from '../components/products/ProductCard';

const ProductDetail = () => {
    const { id } = useParams();
    const { profile, addToCart, cart, addToWishlist, wishlist } = useProfile();
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
                            <button
                                disabled={!product.in_stock}
                                onClick={async () => {
                                    await addToCart(product._id);
                                    alert('Added to Cart!');
                                }}
                                className={`btn-primary flex-1 py-4 text-lg ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {cart.includes(product._id) ? 'Add Another to Cart' : 'Add to Cart'}
                            </button>

                            <button
                                onClick={async () => {
                                    const folder = window.prompt("Enter a folder name (e.g. Living Room), or leave blank for 'General':") ?? 'General';
                                    await addToWishlist(product._id, folder || 'General');
                                    alert(`Saved to ${folder || 'General'} wishlist!`);
                                }}
                                className="btn-secondary py-4 px-6 flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill={wishlist.some(w => w.product === product._id || w.product._id === product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Save
                            </button>
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
