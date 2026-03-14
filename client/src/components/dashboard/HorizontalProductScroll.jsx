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
        primary: {
            bg: 'bg-primary/5',
            text: 'text-dark',
            linkColor: 'text-primary hover:text-primary/80',
            buttonBg: 'bg-white hover:bg-background text-primary',
            border: 'border-primary/10'
        },
        cream: {
            bg: 'bg-[#F5EFE6]',
            text: 'text-dark',
            linkColor: 'text-primary hover:text-primary/80',
            buttonBg: 'bg-white hover:bg-background text-primary',
            border: 'border-[#C4956A]/20'
        },
        white: {
            bg: 'bg-white',
            text: 'text-dark',
            linkColor: 'text-primary hover:text-primary/80',
            buttonBg: 'bg-background hover:bg-[#F5EFE6] text-primary',
            border: 'border-primary/10'
        }
    }[theme] || themeConfig.white;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className={`${themeConfig.bg} rounded-xl shadow-lg border ${themeConfig.border} p-6 relative group overflow-hidden`}>
                <div className="flex justify-between items-baseline mb-4">
                    <h2 className={`text-2xl font-display font-bold ${themeConfig.text} flex items-center gap-3`}>
                        {title}
                        {theme === 'cream' && <span className="bg-primary text-white text-[10px] uppercase px-2 py-0.5 rounded-sm shadow-sm">New</span>}
                        {theme === 'white' && <span className="text-accent text-xl font-sans font-bold">%</span>}
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
                                {theme === 'white' && (
                                    <div className="absolute top-0 right-0 m-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
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
