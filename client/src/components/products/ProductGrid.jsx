import ProductCard from './ProductCard';

const ProductGrid = ({ products, showMatchScore = false, loading = false }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="spinner" />
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🛋️</div>
                <h3 className="text-xl font-display text-dark mb-2">
                    No products found
                </h3>
                <p className="text-gray-600">
                    Try adjusting your filters or check back soon for new items.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product._id}
                    product={product}
                    showMatchScore={showMatchScore}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
