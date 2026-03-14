import { Link } from 'react-router-dom';
// TEST: REVIEWS UPDATED 1234
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import InfiniteMenu from '../components/InfiniteMenu/InfiniteMenu';
import CircularGallery from '../components/CircularGallery/CircularGallery';

// CDN base URL
const CDN = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets';

// Asset paths (served from jsDelivr CDN)
const heroImg = `${CDN}/hero.jpg`;
const getInTouchImg = `${CDN}/design/get%20in%20touch.jpeg`;

// Vibe images for CircularGallery & InfiniteMenu
const vibeImages = {
    bohemian: `${CDN}/Bohemian/Bedroom%2020/1.jpg`,
    scandinavian: `${CDN}/Scandinavian/Bedroom%2020/1.jpg`,
    minimalist: `${CDN}/Minimalist/Bedroom%2020/1.jpg`,
    industrial: `${CDN}/Industrial/Bedroom%2020/1.jpg`,
    modern_luxury: `${CDN}/ModernLuxury/Bedroom%2020/1.jpg`,
    traditional: `${CDN}/Traditional/Bedroom%2020/1.jpg`,
    maximalist: `${CDN}/Maximalist/Bedroom%2020/1.jpg`,
};

// New arrivals images
const newArrivalImages = [
    `${CDN}/newaarivals/na.jpg`,
    `${CDN}/newaarivals/na1.jpg`,
    `${CDN}/newaarivals/na2.jpg`,
    `${CDN}/newaarivals/na3.jpg`,
];

// Review images (15 images)
const reviewImages = Array.from({ length: 15 }, (_, i) => `${CDN}/review/${i + 1}.png`);

// Scroll reveal hook
const useScrollReveal = () => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
};

const Landing = () => {
    const { isAuthenticated } = useAuth();

    // ——— Hero dot indicators ———
    const [heroDot, setHeroDot] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setHeroDot(d => (d + 1) % 5), 4000);
        return () => clearInterval(t);
    }, []);

    // ——— Responsive Gallery Width ———
    const [galWidth, setGalWidth] = useState(500);
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            // Provide padding for mobile devices
            setGalWidth(width < 550 ? width - 48 : 500);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ——— New Arrivals Slideshow ———
    const [naSlide, setNaSlide] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setNaSlide(s => (s + 1) % newArrivalImages.length), 3000);
        return () => clearInterval(t);
    }, []);

    // ——— Reviews carousel ———
    const [reviewIdx, setReviewIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setReviewIdx(i => (i + 1) % reviewImages.length), 4000);
        return () => clearInterval(t);
    }, []);

    // ——— Parallax for Get in Touch ———
    const [parallaxY, setParallaxY] = useState(0);
    const gitRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            if (gitRef.current) {
                const rect = gitRef.current.getBoundingClientRect();
                const offset = (rect.top / window.innerHeight) * 80;
                setParallaxY(offset);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ——— InfiniteMenu items ———
    const menuItems = Object.entries(vibeImages).map(([key, image]) => ({
        image,
        link: '/dashboard',
        title: key.replace('_', ' '),
        description: 'Discover the perfect furniture to match this aesthetic.'
    }));

    // Circular gallery items
    const circularItems = Object.entries(vibeImages).map(([key, image]) => ({
        image,
        title: key.replace('_', ' '),
    }));

    // Section refs for scroll reveal
    const aboutRef = useScrollReveal();
    const arrivalsRef = useScrollReveal();
    const galleryRef = useScrollReveal();
    const gitRevealRef = useScrollReveal();
    const reviewsRef = useScrollReveal();

    return (
        <div className="min-h-screen bg-white" style={{ marginTop: '-64px' }}>
            {/* ═══════════════════════════ 1. HERO ═══════════════════════════ */}
            <section id="hero" className="relative h-screen flex items-end overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="Beautiful interior" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)'
                    }} />
                </div>

                {/* Hero content — bottom-left */}
                <div className="relative z-10 px-6 sm:px-12 pb-28 max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-4 opacity-0 animate-slide-up" style={{ color: 'white' }}>
                        Make Space Feel Like You
                    </h1>
                    <p className="text-lg sm:text-xl text-white/80 mb-8 opacity-0 animate-slide-up-delay-1">
                        Tell us your vibe. We find your furniture.
                    </p>
                    <div className="flex flex-wrap gap-4 opacity-0 animate-slide-up-delay-2">
                        <Link
                            to={isAuthenticated ? '/mode-select' : '/register'}
                            className="bg-primary text-white px-7 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            Start My Vibe Quiz
                        </Link>
                        <Link
                            to="/dashboard"
                            className="bg-transparent border-2 border-white text-white px-7 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105"
                        >
                            Browse our collection
                        </Link>
                    </div>
                </div>

                {/* Dot indicators */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                    {[0, 1, 2, 3, 4].map(i => (
                        <button
                            key={i}
                            onClick={() => setHeroDot(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === heroDot ? 'bg-white scale-125' : 'bg-white/40'}`}
                        />
                    ))}
                </div>

                {/* Animated scroll chevron */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ═══════════════════════════ 2. ABOUT US ═══════════════════════════ */}
            <section id="about" ref={aboutRef} className="scroll-reveal py-20 sm:py-28 px-6 sm:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left — text */}
                    <div>
                        <h2 className="text-4xl sm:text-5xl font-display font-bold mb-8" style={{ color: '#3D1F0D' }}>About Us</h2>
                        <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: '#4a3728' }}>
                            VibeSpace helps you discover furniture that matches your unique design personality.
                            Through a quick visual style quiz, our AI analyzes your preferences and identifies
                            your aesthetic style — whether it's Bohemian warmth, Scandinavian simplicity, or
                            Industrial edge.
                        </p>
                        <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#4a3728' }}>
                            Based on your results, VibeSpace generates personalized mood boards and smart
                            furniture recommendations, making it easier to design spaces that truly match
                            your vibe. No more endless scrolling through generic catalogs — just curated
                            pieces that feel like you.
                        </p>
                    </div>

                    {/* Right — CircularGallery */}
                    <div className="flex justify-center w-full overflow-hidden rounded-2xl" style={{ height: '500px', position: 'relative' }}>
                        <CircularGallery
                            items={circularItems}
                            baseWidth={galWidth}
                            bend={1}
                            textColor="#ffffff"
                            borderRadius={0.5}
                            scrollSpeed={2}
                            scrollEase={0.05}
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ 3. NEW ARRIVALS ═══════════════════════════ */}
            <section id="arrivals" ref={arrivalsRef} className="scroll-reveal">
                <div className="mx-6 sm:mx-12 rounded-2xl overflow-hidden" style={{ backgroundColor: '#C4956A' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        {/* Left — Slideshow */}
                        <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
                            {newArrivalImages.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`New arrival ${i + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                                    style={{ opacity: i === naSlide ? 1 : 0 }}
                                />
                            ))}
                            {/* Overlapping frame effect */}
                            <div className="absolute bottom-4 left-4 w-48 h-36 border-2 border-white/30 rounded-lg" />
                            {/* Dot indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                                {newArrivalImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNaSlide(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === naSlide ? 'bg-white scale-125' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right — Content */}
                        <div className="flex flex-col items-center justify-center p-10 sm:p-16 text-center">
                            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4" style={{ color: '#3D1F0D' }}>
                                New Arrivals
                            </h2>
                            <p className="text-lg mb-8" style={{ color: '#3D1F0D' }}>
                                Explore our new collection and find your best match.
                            </p>
                            <Link
                                to="/dashboard"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105"
                            >
                                Explore
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ 4. OUR GALLERY (InfiniteMenu) ═══════════════════════════ */}
            <section id="gallery" ref={galleryRef} className="scroll-reveal py-20 sm:py-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-8">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold text-center" style={{ color: '#3D1F0D' }}>Our Gallery</h2>
                </div>
                <div className="w-full max-w-[1400px] mx-auto px-4">
                    <div style={{ height: '600px', position: 'relative' }}>
                        {menuItems.length > 0 ? (
                            <InfiniteMenu items={menuItems} scale={1} />
                        ) : (
                            <div className="h-full w-full bg-cream rounded-2xl flex items-center justify-center">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ 5. GET IN TOUCH ═══════════════════════════ */}
            <section id="contact" ref={gitRevealRef} className="scroll-reveal relative overflow-hidden" style={{ height: '450px' }}>
                <div ref={gitRef} className="absolute inset-0" style={{ transform: `translateY(${parallaxY * 0.3}px)` }}>
                    <img
                        src={getInTouchImg}
                        alt="Get In Touch"
                        className="w-full h-full object-cover"
                        style={{ minHeight: '120%' }}
                    />
                </div>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6" style={{ color: 'white' }}>Get In Touch</h2>
                    <p className="text-lg text-white/80 mb-8 max-w-xl">
                        Have a project in mind? Let's create spaces that inspire and delight.
                    </p>
                    <a href="mailto:hello@vibespace.com"
                        className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Contact Us
                    </a>
                </div>
            </section>

            {/* ═══════════════════════════ 6. REVIEWS ═══════════════════════════ */}
            <section ref={reviewsRef} className="scroll-reveal py-20 sm:py-28 bg-white overflow-hidden w-full">
                <div className="max-w-7xl mx-auto px-6 sm:px-12">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold text-center mb-16" style={{ color: '#3D1F0D' }}>
                        What Our Clients Say
                    </h2>

                    <div className="relative overflow-hidden w-full">
                        <div
                            className="flex transition-transform duration-700 ease-in-out w-[200%] sm:w-auto"
                            style={{ transform: `translateX(-${reviewIdx * 50}%)` }}
                        >
                            {/* Doubling the array to allow for a smoother loop feel, though simple index wrap is used */}
                            {reviewImages.map((img, i) => (
                                <div key={i} className="flex-shrink-0 w-1/2 sm:w-1/2 px-2 sm:px-4 h-[300px] sm:h-[600px] flex items-center justify-center">
                                    <div className="w-full h-full">
                                        <img
                                            src={img}
                                            alt={`Review ${i + 1}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination dots (simplified to blocks/groups of 2) */}
                        <div className="flex justify-center mt-8 sm:mt-12 space-x-2 flex-wrap gap-y-2">
                            {reviewImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setReviewIdx(i)}
                                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${i === reviewIdx ? 'bg-primary scale-125' : 'bg-primary/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
