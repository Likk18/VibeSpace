import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import MagicBento from '../components/MagicBento/MagicBento';
import SpotlightCard from '../components/ui/SpotlightCard';

const AestheticReport = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060010] text-white">
                <div className="spinner" />
            </div>
        );
    }

    // Convert hex to RGB for glow effect (assuming primary style color)
    const primaryHex = profile.color_palette[0] || '#8400FF';
    const r = parseInt(primaryHex.slice(1, 3), 16);
    const g = parseInt(primaryHex.slice(3, 5), 16);
    const b = parseInt(primaryHex.slice(5, 7), 16);
    const glowColor = `${r}, ${g}, ${b}`;

    // Map profile data to MagicBento cardData (6 items)
    const cardData = [
        {
            label: 'Primary Vibe',
            title: profile.style_label,
            description: `Your core aesthetic is fundamentally ${profile.primary_style}. It defines the structural and atmospheric foundation of your space.`,
            color: '#0a0018'
        },
        {
            label: 'Secondary Influence',
            title: profile.secondary_style ? profile.secondary_style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Pure Expression',
            description: profile.secondary_style
                ? `A subtle ${profile.secondary_style} undertone adds complexity and depth to your primary aesthetic.`
                : 'Your style is a pure, focused expression of your primary aesthetic without external influences.',
            color: '#0d0024'
        },
        {
            label: 'Dominant Material',
            title: profile.dominant_material.charAt(0).toUpperCase() + profile.dominant_material.slice(1),
            description: `${profile.dominant_material.charAt(0).toUpperCase() + profile.dominant_material.slice(1)} textures anchor your design, providing a tactile sense of comfort and character.`,
            color: profile.color_palette[0] || '#1a0033'
        },
        {
            label: 'Color Story',
            title: 'Curated Palette',
            description: 'A harmonious blend of tones selected to evoke the specific emotional response your aesthetic demands.',
            color: profile.color_palette[1] || '#220044'
        },
        {
            label: 'Atmosphere',
            title: 'Mood & Texture',
            description: `Creating a ${profile.style_label.toLowerCase()} atmosphere involves balancing ${profile.dominant_material} elements with your ${profile.primary_style} layout.`,
            color: profile.color_palette[2] || '#2a0055'
        },
        {
            label: 'Signature',
            title: 'Your Design DNA',
            description: 'This unique combination of style, color, and material creates a space that is authentically and unmistakably yours.',
            color: '#060010',
            Component: SpotlightCard,
            componentProps: {
                spotlightColor: `rgba(${glowColor}, 0.2)`,
                className: "h-full w-full"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-[#020008] text-white py-20 px-4 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h4 className="text-accent uppercase tracking-widest text-sm mb-2">Aesthetic Report</h4>
                        <h1 className="text-5xl md:text-7xl font-display font-bold">
                            The {profile.style_label} <span className="text-primary italic">Identity</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/result')}
                        className="mb-2 px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-sm"
                    >
                        Back to Summary
                    </button>
                </div>

                <MagicBento
                    cardData={cardData}
                    glowColor={glowColor}
                    enableStars={true}
                    enableMagnetism={true}
                    enableTilt={true}
                />

                <div className="mt-20 text-center">
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        This report is a deep dive into your design personality, distilled from your visual preferences and classified by our AI engine.
                    </p>
                    <button
                        onClick={() => navigate('/moodboard')}
                        className="bg-primary text-white text-xl px-12 py-5 rounded-full hover:bg-primary/90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(91,79,207,0.4)]"
                    >
                        Generate Full Mood Board
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AestheticReport;
