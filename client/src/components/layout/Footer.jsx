import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-display font-bold mb-2">VibeSpace</h3>
                        <p className="text-gray-400 mb-4">Make Space Feel Like You.</p>
                        <p className="text-sm text-muted">
                            Personality-driven interior design platform that understands your aesthetic first.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/" className="hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/quiz" className="hover:text-white transition-colors">
                                    Take Quiz
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition-colors">
                                    Shop
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold mb-4">Stay Updated</h4>
                        <form className="space-y-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-primary"
                            />
                            <button className="w-full btn-primary text-sm py-2">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-muted">
                    <p>&copy; 2024 VibeSpace. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
