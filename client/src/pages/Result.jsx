import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import StyleChip from '../components/ui/StyleChip';
import ColorSwatch from '../components/moodboard/ColorSwatch';

/**
 * Map style tags to asset folder names for the aesthetic board
 */
const STYLE_TO_FOLDER = {
    'minimalist': 'Minimalist',
    'bohemian': 'Bohemian',
    'scandinavian': 'Scandinavian',
    'industrial': 'Industrial',
    'modern-luxury': 'ModernLuxury',
    'traditional': 'Traditional',
    'maximalist': 'Maximalist'
};

/**
 * Category folders that reliably exist across all vibes, with approx image counts
 */
const BOARD_CATEGORIES = [
    { folder: 'Bedroom 20', max: 20 },
    { folder: 'Object 20', max: 20 },
    { folder: 'Overall Room 6', max: 6 },
    { folder: 'DIY 8', max: 8 },
    { folder: 'Lamp Fixtures 6', max: 6 },
    { folder: 'Rug 6', max: 6 }
];

/**
 * Get random image URLs for the aesthetic board
 */
const getRandomImages = (vibeFolder, count = 8) => {
    const images = [];

    // Pick one random image from each category
    const shuffledCats = [...BOARD_CATEGORIES].sort(() => Math.random() - 0.5);

    for (const cat of shuffledCats) {
        if (images.length >= count) break;
        const imgNum = Math.floor(Math.random() * cat.max) + 1;
        images.push(`/assets/${vibeFolder}/${encodeURIComponent(cat.folder)}/${imgNum}.jpg`);
    }

    // If we need more, pick extras from the large categories (Bedroom, Object have 20)
    const largeCats = BOARD_CATEGORIES.filter(c => c.max >= 20);
    while (images.length < count) {
        const cat = largeCats[Math.floor(Math.random() * largeCats.length)];
        const imgNum = Math.floor(Math.random() * cat.max) + 1;
        const url = `/assets/${vibeFolder}/${encodeURIComponent(cat.folder)}/${imgNum}.jpg`;
        if (!images.includes(url)) {
            images.push(url);
        }
    }

    return images;
};

const Result = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();
    const [revealed, setRevealed] = useState(false);
    const [boardImages, setBoardImages] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (profile?.primary_style) {
            const vibeFolder = STYLE_TO_FOLDER[profile.primary_style] || 'Minimalist';
            setBoardImages(getRandomImages(vibeFolder, 9));
        }
    }, [profile?.primary_style]);

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

    const formatStyle = (styleStr) => {
        if (!styleStr) return '';
        return styleStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
            <div className="max-w-4xl mx-auto px-4">
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
                                with {formatStyle(profile.secondary_style)} influence
                            </p>
                        )}
                    </div>

                    {/* Aesthetic Board */}
                    {boardImages.length > 0 && (
                        <div className="bg-surface rounded-2xl shadow-xl p-6 mb-8">
                            <h2 className="text-2xl font-display font-semibold mb-6">Your Aesthetic Board</h2>
                            <div className="grid grid-cols-3 gap-2 md:gap-3 rounded-xl overflow-hidden">
                                {boardImages.map((src, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            relative overflow-hidden rounded-lg
                                            ${index === 0 ? 'col-span-2 row-span-2' : ''}
                                            ${index === 4 ? 'col-span-2' : ''}
                                        `}
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    >
                                        <img
                                            src={src}
                                            alt={`${profile.primary_style} inspiration ${index + 1}`}
                                            className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Palette */}
                    <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-display font-semibold mb-6">Your Palette</h2>
                        <div className="flex justify-center space-x-6">
                            {profile.color_palette.map((hex, index) => (
                                <ColorSwatch key={index} hex={hex} />
                            ))}
                        </div>
                    </div>

                    {/* Style Info */}
                    <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-display font-semibold mb-4">Your Style</h2>
                        <div className="flex justify-center flex-wrap gap-3">
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
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => navigate('/aesthetic-report')}
                            className="bg-black text-white text-lg px-12 py-4 rounded-full border border-white/20 hover:bg-black/80 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>✨ View Full Aesthetic Report</span>
                        </button>
                        <button
                            onClick={() => navigate('/moodboard')}
                            className="btn-primary text-lg px-12 py-4"
                        >
                            Generate My Mood Board
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
