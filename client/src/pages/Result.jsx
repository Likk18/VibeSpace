import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import StyleChip from '../components/ui/StyleChip';
import ColorSwatch from '../components/moodboard/ColorSwatch';

const Result = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        // Trigger reveal animation after component mounts
        const timer = setTimeout(() => setRevealed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const shareText = `I just discovered my interior design aesthetic: ${profile.style_label}! Find yours at VibeSpace.`;

    const handleShare = (platform) => {
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
        };
        window.open(urls[platform], '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Reveal Animation */}
                <div className={`text-center transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-400 mb-2">Your Aesthetic:</p>
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4">
                            {profile.style_label}
                        </h1>
                        {profile.secondary_style && (
                            <p className="text-xl text-gray-400">
                                with {profile.secondary_style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} influence
                            </p>
                        )}
                    </div>

                    {/* Color Palette */}
                    <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-display font-semibold mb-6">Your Palette</h2>
                        <div className="flex justify-center space-x-6">
                            {profile.color_palette.map((hex, index) => (
                                <ColorSwatch key={index} hex={hex} />
                            ))}
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-display font-semibold mb-4">Your Materials</h2>
                        <div className="flex justify-center flex-wrap gap-3">
                            <StyleChip style={profile.dominant_material} size="lg" />
                            <StyleChip style={profile.primary_style} size="lg" />
                            {profile.secondary_style && (
                                <StyleChip style={profile.secondary_style} size="lg" />
                            )}
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="mb-8">
                        <p className="text-sm text-gray-400 mb-3">Share your aesthetic:</p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => handleShare('twitter')}
                                className="px-6 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
                            >
                                🐦 Twitter
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="px-6 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
                            >
                                💬 WhatsApp
                            </button>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => navigate('/moodboard')}
                        className="btn-primary text-lg px-12 py-4"
                    >
                        Generate My Mood Board
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Result;
