import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { productsAPI } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import CategoryNav from '../components/dashboard/CategoryNav';
import HeroCarousel from '../components/dashboard/HeroCarousel';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import HorizontalProductScroll from '../components/dashboard/HorizontalProductScroll';

const Dashboard = () => {
    const location = useLocation();
    const { profile, personalizationOn, feedMode } = useProfile();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterOptions, setFilterOptions] = useState({ designers: [] });
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: false });
    const [showFilters, setShowFilters] = useState(false);
    const [mainLoading, setMainLoading] = useState(true);
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [offersProducts, setOffersProducts] = useState([]);

    const [filters, setFilters] = useState({
        search: '',
        category: [],
        designers: [],
        minPrice: '',
        maxPrice: '',
        newArrivals: false
    });

    // Infinite scroll sentinel ref
    const sentinelRef = useRef(null);

    // Load initial data (categories, filters, feed) on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setMainLoading(true);
                const [categoriesRes, filterRes, feedRes, newArrivalsRes, offersRes] = await Promise.all([
                    productsAPI.getCategories(),
                    productsAPI.getFilterOptions(),
                    productsAPI.getFeed(feedMode, 1, 12),
                    productsAPI.search({ newArrivals: true, limit: 12 }),
                    productsAPI.search({ tag: 'offers', limit: 12 })
                ]);
                setCategories(categoriesRes.data.data.categories || []);
                setFilterOptions(filterRes.data.data || { designers: [] });
                setProducts(feedRes.data.data.products || []);
                setPagination(feedRes.data.pagination || { page: 1, totalPages: 1, hasMore: false });
                setNewArrivalsProducts(newArrivalsRes.data.data.products || []);
                setOffersProducts(offersRes.data.data.products || []);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            } finally {
                setMainLoading(false);
            }
        };
        loadInitialData();
    }, [feedMode]);

    const fetchProducts = async (page = 1, append = false, activeFilters = filters) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setMainLoading(true);
        }
        
        try {
            const params = {
                page,
                limit: 12,
                ...(activeFilters.search && { q: activeFilters.search }),
                ...(activeFilters.category.length > 0 && { category: activeFilters.category.join(',') }),
                ...(activeFilters.designers.length > 0 && { designer: activeFilters.designers.join(',') }),
                ...(activeFilters.minPrice && { minPrice: activeFilters.minPrice }),
                ...(activeFilters.maxPrice && { maxPrice: activeFilters.maxPrice }),
                ...(activeFilters.newArrivals && { newArrivals: true })
            };

            const filtersActive = Object.entries(activeFilters).some(
                ([key, val]) => {
                    if (key === 'newArrivals') return val === true;
                    return Array.isArray(val) ? val.length > 0 : val;
                }
            );

            const response = filtersActive 
                ? await productsAPI.search(params)
                : await productsAPI.getFeed(feedMode, page, 12);

            const newProducts = response.data.data.products;
            
            if (append) {
                setProducts(prev => [...prev, ...newProducts]);
            } else {
                setProducts(newProducts);
            }

            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setMainLoading(false);
            setLoadingMore(false);
        }
    };

    // Handle URL query changes (from Category Nav or Widgets)
    useEffect(() => {
        // Skip on initial mount since loadInitialData runs anyway,
        // but if there are filters in URL, we want to catch them.
        const query = new URLSearchParams(location.search);
        const filterStr = query.get('filter');
        const catStr = query.get('category');
        
        // If no query params exist, we don't need to override
        if (!filterStr && !catStr && !location.search) return;

        setFilters(prev => {
            const next = {
                ...prev,
                category: catStr ? [catStr] : [],
                newArrivals: filterStr === 'new'
            };
            
            // Only fetch if it actually changed to prevent double-fetch on mount
            if (JSON.stringify(prev) !== JSON.stringify(next)) {
                fetchProducts(1, false, next);
            }
            return next;
        });
    }, [location.search]);

    const handleSearch = async (e) => {
        e.preventDefault();
        fetchProducts(1);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleMultiSelectChange = (key, value, checked) => {
        setFilters(prev => {
            const current = prev[key];
            if (checked) {
                return { ...prev, [key]: [...current, value] };
            } else {
                return { ...prev, [key]: current.filter(item => item !== value) };
            }
        });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: [],
            designers: [],
            minPrice: '',
            maxPrice: '',
            newArrivals: false
        });
        fetchProducts(1);
    };

    const loadMore = useCallback(() => {
        if (pagination.hasMore && !loadingMore && !mainLoading) {
            fetchProducts(pagination.page + 1, true);
        }
    }, [pagination, loadingMore, mainLoading]);

    const hasActiveFilters = Object.entries(filters).some(
        ([key, val]) => {
            if (key === 'newArrivals') return val === true;
            return Array.isArray(val) ? val.length > 0 : val;
        }
    );

    // Infinite scroll via Intersection Observer
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <div className="min-h-screen bg-background pt-16 pb-12">
            {/* Zone 2: Category Nav Strip */}
            <CategoryNav />

            {/* Amazon-Style Home Zones (Only shown if NO search/active filters) */}
            {!hasActiveFilters && (
                <>
                    {/* Zone 3: Hero Carousel */}
                    <HeroCarousel />
                    
                    {/* Zone 4: Personalized 4-Widget Grid */}
                    <div className="relative z-20">
                        <WidgetGrid products={products} />
                    </div>

                    {/* Zone 5: New Arrivals Horizontal Scroll */}
                    <HorizontalProductScroll 
                        title="New Arrivals" 
                        products={newArrivalsProducts} 
                        theme="cream" 
                    />
                    
                    {/* Zone 6: Offers/Deals Horizontal Scroll */}
                    <HorizontalProductScroll 
                        title="Today's Deals" 
                        products={offersProducts} 
                        theme="white" 
                    />
                </>
            )}

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${!hasActiveFilters ? 'mt-8' : 'mt-8'}`}>
                {/* Header (Only show for filtered browsing) */}
                {hasActiveFilters && (
                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-bold text-dark mb-2">
                            {personalizationOn && profile ? `Your ${profile.style_label} Feed` : 'All Products'}
                        </h1>
                        <p className="text-gray-600">
                            Search Results and Filtered Browsing
                        </p>
                    </div>
                )}

                {/* Filter Toggle */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        {hasActiveFilters && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                Active
                            </span>
                        )}
                    </button>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-red-500"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-surface rounded-xl shadow-md p-6 mb-6">
                        <form onSubmit={handleSearch}>
                            {/* Search Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="input"
                                />
                                
                                {/* Category Multi-select */}
                                <div className="relative">
                                    <select
                                        value={filters.category[0] || ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleFilterChange('category', [e.target.value]);
                                            } else {
                                                handleFilterChange('category', []);
                                            }
                                        }}
                                        className="input"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

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

                                <button type="submit" className="btn-primary">
                                    Apply Filters
                                </button>
                            </div>

                            {/* Filter Options Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                {/* New Arrivals Toggle */}
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={filters.newArrivals}
                                            onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
                                            className="rounded text-primary w-5 h-5"
                                        />
                                        <div>
                                            <span className="font-medium text-sm">✨ New Arrivals</span>
                                            <p className="text-xs text-gray-400">Products added in the last 30 days</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Designers */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Designers</label>
                                    <div className="max-h-32 overflow-y-auto bg-background rounded-lg p-2 space-y-1">
                                        {(filterOptions.designers || []).slice(0, 10).map((designer) => (
                                            <label key={designer} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.designers.includes(designer)}
                                                    onChange={(e) => handleMultiSelectChange('designers', designer, e.target.checked)}
                                                    className="rounded text-primary"
                                                />
                                                <span className="text-sm truncate">{designer}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-500">
                    Showing {products.length} products
                    {pagination.total && ` of ${pagination.total}`}
                </div>

                {/* Products Grid */}
                <ProductGrid
                    products={products}
                    showMatchScore={personalizationOn}
                    loading={mainLoading}
                />

                {/* Infinite Scroll Sentinel */}
                {pagination.hasMore && (
                    <div ref={sentinelRef} className="text-center mt-8 py-4">
                        {loadingMore && (
                            <span className="flex items-center justify-center gap-2 text-gray-400">
                                <div className="spinner" style={{ width: '20px', height: '20px' }} />
                                Loading more products...
                            </span>
                        )}
                    </div>
                )}

                {!mainLoading && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No products found</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-primary hover:underline"
                            >
                                Clear filters to see more products
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
