import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { moodboardAPI } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import ColorSwatch from '../components/moodboard/ColorSwatch';
import TextureCard from '../components/moodboard/TextureCard';
import InspirationGrid from '../components/moodboard/InspirationGrid';
import ProductCard from '../components/products/ProductCard';

const MoodBoard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { profile, groupProfile } = useProfile();
    const [moodboard, setMoodboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [moodboardMode, setMoodboardMode] = useState('personal');

    useEffect(() => {
        const mode = location.state?.mode || 'personal';
        setMoodboardMode(mode);
        generateMoodBoard(mode);
    }, [location.state?.mode]);

    const generateMoodBoard = async (mode = 'personal') => {
        setLoading(true);
        try {
            const response = await moodboardAPI.generate(mode);
            setMoodboard(response.data.data);
        } catch (error) {
            console.error('Failed to generate mood board:', error);
            alert('Failed to generate mood board. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!moodboard?.pool) return;

        setRegenerating(true);

        // Intentional 500ms delay for psychological effect
        setTimeout(async () => {
            try {
                const response = await moodboardAPI.regenerate(moodboard.pool);
                setMoodboard(prev => ({
                    ...prev,
                    inspiration: response.data.data.inspiration,
                    products: response.data.data.products,
                    textures: response.data.data.textures
                }));
            } catch (error) {
                console.error('Failed to regenerate:', error);
            } finally {
                setRegenerating(false);
            }
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mb-4" />
                    <p className="text-gray-400">Generating your mood board...</p>
                </div>
            </div>
        );
    }

    if (!moodboard) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Failed to load mood board</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        {moodboardMode === 'group' ? 'Group Mood Board' : 'Your Mood Board'}
                    </h1>
                    
                    {user?.mode === 'group' && groupProfile && (
                        <div className="flex justify-center gap-3 mb-4">
                            <button
                                onClick={() => {
                                    setMoodboardMode('personal');
                                    generateMoodBoard('personal');
                                }}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                    moodboardMode === 'personal' 
                                        ? 'bg-primary text-white' 
                                        : 'bg-surface text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                My Style
                            </button>
                            <button
                                onClick={() => {
                                    setMoodboardMode('group');
                                    generateMoodBoard('group');
                                }}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                    moodboardMode === 'group' 
                                        ? 'bg-primary text-white' 
                                        : 'bg-surface text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                Group Mix
                            </button>
                        </div>
                    )}
                    
                    {moodboard?.profile_info && (
                        <div className="flex justify-center">
                            <div className="style-chip text-lg">
                                {moodboard.profile_info.style_label}
                            </div>
                        </div>
                    )}
                </div>

                {/* Color Palette & Textures */}
                <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Colors */}
                        <div>
                            <h2 className="text-2xl font-display font-semibold mb-6 text-center">
                                {moodboardMode === 'group' ? 'Group Colors' : 'Your Colors'}
                            </h2>
                            <div className="flex justify-center space-x-6">
                                {moodboard.palette.map((hex, index) => (
                                    <ColorSwatch key={index} hex={hex} />
                                ))}
                            </div>
                        </div>

                        {/* Textures */}
                        <div>
                            <h2 className="text-2xl font-display font-semibold mb-6 text-center">
                                Your Textures
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {moodboard.textures.map((texture, index) => (
                                    <TextureCard key={index} {...texture} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspiration Images */}
                <div className="mb-8">
                    <h2 className="text-3xl font-display font-semibold mb-6 text-center">
                        Room Inspiration
                    </h2>
                    <InspirationGrid images={moodboard.inspiration} />
                </div>

                {/* Product Recommendations */}
                <div className="mb-8">
                    <h2 className="text-3xl font-display font-semibold mb-6 text-center">
                        Perfect For You
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {moodboard.products.map((product) => (
                            <ProductCard key={product._id} product={product} showMatchScore />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="btn-secondary px-8 py-3"
                    >
                        {regenerating ? (
                            <span className="flex items-center justify-center">
                                <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                Regenerating...
                            </span>
                        ) : (
                            '🔄 Regenerate Board'
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary px-8 py-3"
                    >
                        Approve & Shop My Vibe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoodBoard;
