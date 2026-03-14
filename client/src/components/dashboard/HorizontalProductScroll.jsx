import { useRef } from 'react';
import { Link } from 'react-router-dom';

const HorizontalProductScroll = ({ title, products = [], theme = 'dark' }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    // Theme configurations
    const themeConfig = {
        dark: {
            bg: 'bg-surface',
            text: 'text-white',
            linkColor: 'text-primary hover:text-primary/80',
            buttonBg: 'bg-black/50 hover:bg-black/80',
            border: 'border-white/5'
        },
        emerald: {
            bg: 'bg-teal-900',
            text: 'text-teal-50',
            linkColor: 'text-teal-200 hover:text-teal-100',
            buttonBg: 'bg-teal-950/50 hover:bg-teal-950/80',
            border: 'border-teal-800'
        },
        amber: {
            bg: 'bg-amber-900',
            text: 'text-amber-50',
            linkColor: 'text-amber-200 hover:text-amber-100',
            buttonBg: 'bg-amber-950/50 hover:bg-amber-950/80',
            border: 'border-amber-800'
        }
    }[theme] || themeConfig.dark;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className={`${themeConfig.bg} rounded-xl shadow-lg border ${themeConfig.border} p-6 relative group overflow-hidden`}>
                <div className="flex justify-between items-baseline mb-4">
                    <h2 className={`text-2xl font-display font-bold ${themeConfig.text} flex items-center gap-3`}>
                        {title}
                        {theme === 'emerald' && <span className="bg-teal-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-sm shadow-sm">New</span>}
                        {theme === 'amber' && <span className="text-[#F3A847] text-xl">★</span>}
                    </h2>
                    <Link to="/dashboard" className={`${themeConfig.linkColor} text-sm font-medium hover:underline`}>
                        See all →
                    </Link>
                </div>

                {/* Left Scroll Button */}
                <button 
                    onClick={() => scroll('left')}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${themeConfig.buttonBg} text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl border border-white/10`}
                    aria-label="Scroll left"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Scroll Container */}
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth py-2"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {products.map((p, idx) => (
                        <Link 
                            key={p._id || idx} 
                            to={`/product/${p._id}`}
                            className="flex-none w-[200px] bg-background rounded-lg overflow-hidden group/card relative"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            <div className="aspect-[4/5] overflow-hidden bg-white">
                                <img 
                                    src={p.image_url} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" 
                                />
                                {theme === 'amber' && (
                                    <div className="absolute top-0 right-0 m-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
                                        -20% OFF
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Right Scroll Button */}
                <button 
                    onClick={() => scroll('right')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${themeConfig.buttonBg} text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl border border-white/10`}
                    aria-label="Scroll right"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

export default HorizontalProductScroll;
