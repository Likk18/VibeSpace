import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GROUP_MODES } from '../utils/constants';
import ModeCard from '../components/ui/ModeCard';
import WeightSlider from '../components/ui/WeightSlider';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ModeSelect = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [selectedMode, setSelectedMode] = useState(null);
    const [weights, setWeights] = useState([0.5, 0.5]);
    const [memberCount, setMemberCount] = useState(2);
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedMode) return;

        setLoading(true);
        try {
            if (selectedMode === 'single') {
                // Single mode - go straight to quiz
                navigate('/quiz');
            } else {
                // Group mode - create group
                const weightsMap = {
                    // For now, just set equal weights for all members
                    // In a full implementation, you'd collect user IDs
                };

                await groupAPI.create({
                    mode_label: selectedMode,
                    member_count: memberCount,
                    weights: weightsMap
                });

                updateUser({ mode: 'group' });
                navigate('/quiz');
            }
        } catch (error) {
            console.error('Failed to set mode:', error);
            alert('Failed to set mode. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Who are you designing for?
                    </h1>
                    <p className="text-lg text-gray-400">
                        Choose your mode to get started
                    </p>
                </div>

                {/* Single Mode Card */}
                <div className="mb-6">
                    <button
                        onClick={() => setSelectedMode('single')}
                        className={`
              w-full p-6 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedMode === 'single'
                                ? 'border-primary bg-primary/5 shadow-lg'
                                : 'border-white/10 hover:border-primary/50 hover:shadow-md bg-surface'
                            }
            `}
                    >
                        <div className="flex items-center">
                            <div className="text-4xl mr-4">🙋</div>
                            <div>
                                <h3 className="font-display text-xl font-semibold mb-1">
                                    Just Me
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Design your personal space
                                </p>
                            </div>
                            {selectedMode === 'single' && (
                                <div className="ml-auto">
                                    <div className="bg-primary text-white rounded-full p-1">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Group Modes */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-300">
                        Or design together
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {GROUP_MODES.map((mode) => (
                            <ModeCard
                                key={mode.value}
                                mode={mode}
                                selected={selectedMode === mode.value}
                                onSelect={setSelectedMode}
                            />
                        ))}
                    </div>
                </div>

                {/* Weight Slider (only show for group modes) */}
                {selectedMode && selectedMode !== 'single' && (
                    <div className="mb-8 animate-slide-up">
                        <WeightSlider onChange={setWeights} />
                    </div>
                )}

                {/* Continue Button */}
                <div className="text-center">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedMode || loading}
                        className={`
              btn-primary text-lg px-12 py-4
              ${!selectedMode || loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                Setting up...
                            </span>
                        ) : (
                            "Let's Find Your Vibe"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModeSelect;
