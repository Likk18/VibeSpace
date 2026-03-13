import { Link } from 'react-router-dom';

const Footer = () => {
    const columns = [
        {
            title: 'Explore',
            links: [
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/#about' },
                { label: 'Gallery', to: '/#gallery' },
                { label: 'New Arrivals', to: '/#arrivals' },
            ]
        },
        {
            title: 'Booking',
            links: [
                { label: 'Vibe Quiz', to: '/quiz' },
                { label: 'Mood Board', to: '/moodboard' },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Checkout', to: '/checkout' },
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About', to: '/#about' },
                { label: 'Careers', to: '#' },
                { label: 'Press', to: '#' },
                { label: 'Blog', to: '#' },
            ]
        },
        {
            title: 'Support',
            links: [
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact Us', to: '/#contact' },
                { label: 'Returns', to: '#' },
                { label: 'Shipping', to: '#' },
            ]
        }
    ];

    return (
        <footer className="relative mt-0">
            {/* Wavy SVG divider */}
            <div className="w-full overflow-hidden leading-none">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16" style={{ display: 'block' }}>
                    <path d="M0,0 C150,90 350,0 500,50 C650,100 800,20 1000,60 C1100,80 1150,40 1200,50 L1200,120 L0,120 Z" fill="#3D1F0D" />
                </svg>
            </div>

            <div className="bg-dark text-white" style={{ backgroundColor: '#3D1F0D' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {columns.map(col => (
                            <div key={col.title}>
                                <h4 className="text-lg font-display font-semibold mb-5 text-white">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map(link => (
                                        <li key={link.label}>
                                            <Link to={link.to} className="text-sm text-white/60 hover:text-white transition-colors duration-300">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-5 mb-6 md:mb-0">
                            {/* Instagram */}
                            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                            {/* Pinterest */}
                            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-center md:text-right">
                            <p className="text-sm text-white/50">
                                &copy; 2026 VibeSpace. All rights reserved.
                            </p>
                            <div className="mt-2 space-x-4">
                                <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-300">Privacy Policy</a>
                                <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-300">Terms</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
