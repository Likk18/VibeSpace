import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=2000',
        title: 'Up to 40% off | Sofas & Sectionals',
        subtitle: 'Upgrade your living space',
        cta: 'Shop Now',
        link: '/category/living-room'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000',
        title: 'New Arrivals: Spring Collection',
        subtitle: 'Fresh looks for the season',
        cta: 'Explore',
        link: '/new'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=2000',
        title: 'Premium Lighting Deals',
        subtitle: 'Illuminate your aesthetic',
        cta: 'View Offers',
        link: '/category/lighting'
    }
];

const HeroCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-black group">
            {/* Slides container */}
            <div 
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div 
                        key={slide.id} 
                        className="w-full h-full flex-shrink-0 relative"
                    >
                        <img 
                            src={slide.image} 
                            alt={slide.title} 
                            className="w-full h-full object-cover opacity-80"
                        />
                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                        
                        {/* Text Content */}
                        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 max-w-xl">
                                {slide.title}
                            </h2>
                            <p className="text-xl text-gray-200 mb-6 font-light max-w-md">
                                {slide.subtitle}
                            </p>
                            <Link 
                                to={slide.link}
                                className="bg-[#FF9900] hover:bg-[#E38900] text-dark font-bold py-3 px-8 rounded-full w-max mt-2 transition-colors shadow-lg"
                            >
                                {slide.cta}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
            
            {/* Amazon-style fade at bottom to blend into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
        </div>
    );
};

export default HeroCarousel;
