import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';

const AestheticReport = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();
    const { updateUser } = useAuth();
    const [retaking, setRetaking] = useState(false);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
                <div className="spinner border-gray-900 border-t-transparent border-4 w-12 h-12 rounded-full animate-spin" />
            </div>
        );
    }

    const formatStyle = (styleStr) => {
        if (!styleStr) return '';
        return styleStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const handlePlayAgain = async () => {
        if (!confirm('Are you sure you want to retake the quiz? Your current style profile will be reset.')) return;
        setRetaking(true);
        try {
            await quizAPI.retake();
            updateUser({ quiz_complete: false });
            navigate('/quiz');
        } catch (error) {
            console.error('Failed to reset quiz:', error);
            alert('Failed to reset quiz. Please try again.');
        } finally {
            setRetaking(false);
        }
    };

    const shareUrl = window.location.origin + '/result';
    const shareText = `I just discovered my interior design aesthetic: ${profile.style_label}! Find yours at VibeSpace.`;

    const handleShare = (platform) => {
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            messenger: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`
        };
        window.open(urls[platform], '_blank');
    };

    return (
        <div className="min-h-screen bg-white text-[#333333] py-16 px-4 sm:px-6 lg:px-8 font-sans leading-relaxed">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 text-center text-black">Your Unique Aesthetic Blend!</h1>

                <div className="space-y-12 mb-16">
                    {/* Primary Style */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            {formatStyle(profile.primary_style)}
                        </h2>
                        <p className="mb-4 text-lg">
                            <strong>Your core aesthetic is fundamentally {formatStyle(profile.primary_style)}.</strong> It defines the structural and atmospheric foundation of your space. You thrive in environments that align with this specific design language.
                        </p>
                        <p className="text-lg">
                            People with a {formatStyle(profile.primary_style)} preference gravitate towards its distinct visual harmony. We recommend focusing on foundational furniture pieces that embody this style, establishing a strong base before layering additional elements. <strong>Consistency in your base structural pieces is key</strong> to maintaining the authentic feel of this aesthetic.
                        </p>
                    </section>

                    {/* Secondary Style */}
                    {profile.secondary_style && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black">
                                {formatStyle(profile.secondary_style)} Influence
                            </h2>
                            <p className="mb-4 text-lg">
                                <strong>You also have a strong affinity for {formatStyle(profile.secondary_style)} elements!</strong> A subtle {formatStyle(profile.secondary_style)} undertone adds complexity, personality, and depth to your primary aesthetic.
                            </p>
                            <p className="text-lg">
                                To perfectly blend these two, keep your major furniture pieces aligned with your primary vibe, but use lighting, textiles, and decorative objects to introduce your secondary influence. <strong>Contrast and careful curation are your friends here</strong>—mixing styles creates spaces that look deeply personal and collected over time rather than bought from a single catalog.
                            </p>
                        </section>
                    )}

                    {/* Color Palette & Vibe */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Atmosphere & Curated Palette
                        </h2>
                        <p className="mb-6 text-lg">
                            Creating a <em>{profile.style_label.toLowerCase()}</em> atmosphere involves balancing curated elements with your specific architectural layout. Your color story is a harmonious blend of tones selected to evoke the specific emotional response your aesthetic demands.
                        </p>

                        {profile.color_palette && profile.color_palette.length > 0 && (
                            <div className="mt-8 mb-6">
                                <p className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Your Suggested Palette</p>
                                <div className="flex gap-4">
                                    {profile.color_palette.map((color, idx) => (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div
                                                className="w-16 h-16 rounded-full shadow-md border border-gray-200 mb-2"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs text-gray-500 uppercase">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-col items-center border-t border-gray-200 pt-12 mt-12 pb-20">
                    <button
                        onClick={handlePlayAgain}
                        disabled={retaking}
                        className="bg-[#2088d4] hover:bg-[#1a75b8] text-white text-lg font-medium px-8 py-3 w-full max-w-md rounded shadow transition-colors mb-8 disabled:opacity-50"
                    >
                        {retaking ? 'Resetting...' : 'Play again'}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-gray-700">Share your result</span>
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-10 h-10 bg-[#3b5998] hover:bg-[#2d4373] text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Share on Facebook"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-10 h-10 bg-[#00aced] hover:bg-[#0084b4] text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Share on Twitter"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                        </button>
                        <button
                            onClick={() => handleShare('messenger')}
                            className="w-10 h-10 bg-[#006AFF] hover:bg-[#005AE6] text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Share on Messenger"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.898 1.5 5.485 3.824 7.152v3.313L9.36 20.1a10.875 10.875 0 002.64.316c5.522 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.09 12.35l-2.827-3.02-5.503 3.02 6.06-6.438 2.88 3.02 5.45-3.02-6.06 6.438z"></path></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AestheticReport;
