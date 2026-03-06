import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import ProductGrid from '../components/products/ProductGrid';

const Dashboard = () => {
    const { profile, personalizationOn } = useProfile();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        search: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [personalizationOn]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getFeed();
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productsAPI.getCategories();
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Map frontend filter state to backend query params
            const searchParams = {
                q: filters.search,
                category: filters.category,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice
            };
            
            const response = await productsAPI.search(searchParams);
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold mb-2">
                        {personalizationOn && profile ? `Your ${profile.style_label} Feed` : 'All Products'}
                    </h1>
                    <p className="text-gray-400">
                        {personalizationOn && profile
                            ? 'Curated just for your aesthetic'
                            : 'Browse our full collection'
                        }
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-surface rounded-xl shadow-md p-6 mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="input"
                        />

                        {/* Category */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="input"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Price Range */}
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                placeholder="Min $"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="input w-1/2"
                            />
                            <input
                                type="number"
                                placeholder="Max $"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="input w-1/2"
                            />
                        </div>

                        {/* Search Button */}
                        <button type="submit" className="btn-primary">
                            Search
                        </button>
                    </form>
                </div>

                {/* Products Grid */}
                <ProductGrid
                    products={products}
                    showMatchScore={personalizationOn}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Dashboard;
