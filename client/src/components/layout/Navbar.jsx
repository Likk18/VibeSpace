import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { profile, personalizationOn, togglePersonalization, cart, wishlist } = useProfile();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const location = useLocation();

    // Check if user is browsing products
    const isBrowsingProducts = location.pathname === '/dashboard' || location.pathname.startsWith('/product');

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = async () => {
        try {
            await togglePersonalization();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    return (
        <nav className="bg-[#000000] shadow-md sticky top-0 z-50 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
                        <span className="text-2xl font-display font-bold text-primary">
                            VibeSpace
                        </span>
                    </Link>

                    {/* Center - Style Label (if on dashboard) */}
                    {isAuthenticated && profile && isBrowsingProducts && (
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
                                {isBrowsingProducts && (
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
                                <div className="flex items-center space-x-3 relative" ref={menuRef}>
                                    <span className="text-sm text-gray-300">
                                        {user.name}
                                    </span>

                                    <button
                                        onClick={() => setMenuOpen(!menuOpen)}
                                        className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#000000]"
                                    >
                                        <span className="font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {menuOpen && (
                                        <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={{ transformOrigin: 'top right' }}>
                                            {/* Top arrow pointer */}
                                            <div className="absolute top-0 right-4 w-3 h-3 bg-white transform -translate-y-1/2 rotate-45 border-l border-t border-gray-100"></div>

                                            <div className="py-1 relative bg-white">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm border-none font-medium text-gray-900 truncate">
                                                        {user.email || 'My Account'}
                                                    </p>
                                                </div>

                                                <Link to="/settings" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    Settings
                                                </Link>

                                                <Link to="/orders" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                                    Orders
                                                </Link>

                                                <Link to="/security" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                                    Security
                                                </Link>

                                                <Link to="/vibepay" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                                    VibePay
                                                </Link>

                                                <Link to="/faq" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    FAQ
                                                </Link>

                                                <div className="border-t border-gray-100 mt-1">
                                                    <button
                                                        onClick={() => { setMenuOpen(false); logout(); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
