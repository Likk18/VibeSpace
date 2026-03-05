import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    const styles = [
        { name: 'Minimalist', emoji: '🤍', desc: 'Clean. Intentional. Calm.' },
        { name: 'Bohemian', emoji: '🌿', desc: 'Layered. Global. Free-spirited.' },
        { name: 'Scandinavian', emoji: '🕯️', desc: 'Functional. Warm. Natural.' },
        { name: 'Industrial', emoji: '🏭', desc: 'Raw. Urban. Utilitarian.' },
        { name: 'Modern Luxury', emoji: '✨', desc: 'Sleek. Glamorous. Rich.' },
        { name: 'Traditional', emoji: '🏛️', desc: 'Classic. Timeless. Elegant.' }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920"
                        alt="Beautiful interior"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
                        Make Space Feel Like You
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in animate-delay-100">
                        Tell us your vibe. We find your furniture.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-200">
                        <Link to={isAuthenticated ? "/mode-select" : "/register"} className="btn-primary text-lg px-8 py-4">
                            Start My Vibe Quiz
                        </Link>
                        <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4 bg-surface/10 backdrop-blur-sm border-white text-white hover:bg-surface hover:text-primary">
                            Browse Everything
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center mb-16">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '1', title: 'Take the Visual Quiz', desc: '25 quick questions to discover your aesthetic DNA', icon: '📸' },
                            { step: '2', title: 'See Your Aesthetic', desc: 'Get your personalized style label and mood board', icon: '🎨' },
                            { step: '3', title: 'Shop Your Vibe', desc: 'Every product is ranked by how well it fits you', icon: '🛋️' }
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="text-6xl mb-4">{item.icon}</div>
                                <div className="text-4xl font-display font-bold text-primary mb-2">{item.step}</div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Style Gallery */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center mb-4">
                        Explore Design Styles
                    </h2>
                    <p className="text-center text-gray-400 mb-12">
                        Discover your aesthetic identity
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {styles.map((style) => (
                            <Link
                                key={style.name}
                                to="/dashboard"
                                className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                    <div className="text-5xl mb-3">{style.emoji}</div>
                                    <h3 className="text-2xl font-display font-bold text-light mb-2">
                                        {style.name}
                                    </h3>
                                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {style.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center mb-16">
                        What People Are Saying
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Priya S.', quote: 'Finally found a sofa that actually fits our flat. The quiz nailed our style!', avatar: '👩' },
                            { name: 'Rahul M.', quote: 'My partner and I have totally different tastes. The merge feature saved us hours of arguing.', avatar: '👨' },
                            { name: 'Ananya K.', quote: 'I never knew I was a "Warm Minimalist" but now I can\'t unsee it. Everything makes sense!', avatar: '👩‍🦱' }
                        ].map((testimonial, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex items-center mb-4">
                                    <div className="text-4xl mr-3">{testimonial.avatar}</div>
                                    <div>
                                        <div className="font-semibold">{testimonial.name}</div>
                                        <div className="text-yellow-400">★★★★★</div>
                                    </div>
                                </div>
                                <p className="text-gray-400 italic">"{testimonial.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Ready to Find Your Vibe?
                    </h2>
                    <p className="text-xl mb-8 text-primary-100">
                        Take the quiz. See your aesthetic. Shop furniture that feels like you.
                    </p>
                    <Link to={isAuthenticated ? "/mode-select" : "/register"} className="btn-accent text-lg px-8 py-4 inline-block">
                        Start Your Journey
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;
