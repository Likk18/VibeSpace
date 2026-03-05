import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { profile, personalizationOn, togglePersonalization, cart, wishlist } = useProfile();

    const handleToggle = async () => {
        try {
            await togglePersonalization();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    return (
        <nav className="bg-surface shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-display font-bold text-primary">
                            VibeSpace
                        </span>
                    </Link>

                    {/* Center - Style Label (if on dashboard) */}
                    {isAuthenticated && profile && window.location.pathname === '/dashboard' && (
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="style-chip text-base">
                                {profile.style_label}
                            </div>
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Personalization Toggle (only on dashboard) */}
                                {window.location.pathname === '/dashboard' && (
                                    <button
                                        onClick={handleToggle}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${personalizationOn
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                            }`}
                                    >
                                        Personalization: {personalizationOn ? 'ON' : 'OFF'}
                                    </button>
                                )}

                                {/* Navigation Links */}
                                <div className="flex items-center space-x-4 pr-4 border-r border-white/10">
                                    <Link to="/wishlist" className="relative text-gray-400 hover:text-primary transition-colors flex items-center">
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Wishlist
                                        {(wishlist?.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {wishlist.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to="/cart" className="relative text-gray-400 hover:text-primary transition-colors flex items-center">
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Cart
                                        {(cart?.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {cart.length}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-300">
                                        {user.name}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary text-sm py-2 px-4"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
