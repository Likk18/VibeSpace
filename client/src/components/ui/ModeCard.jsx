import { useState } from 'react';
import { GROUP_MODES } from '../../utils/constants';

const ModeCard = ({ mode, selected, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    const icons = {
        partner: '💑',
        roommates: '🏠',
        family: '👨‍👩‍👧‍👦',
        custom: '⚙️'
    };

    return (
        <button
            onClick={() => onSelect(mode.value)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
        relative p-6 rounded-xl border-2 transition-all duration-300
        ${selected
                    ? 'border-primary bg-primary/5 shadow-lg scale-105'
                    : 'border-white/10 hover:border-primary/50 hover:shadow-md'
                }
        ${isHovered && !selected ? 'scale-102' : ''}
      `}
        >
            <div className="text-center">
                <div className="text-4xl mb-3">
                    {icons[mode.value] || '✨'}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                    {mode.label}
                </h3>
                <p className="text-sm text-gray-400">
                    {mode.description}
                </p>
            </div>

            {/* Selected Indicator */}
            {selected && (
                <div className="absolute top-3 right-3">
                    <div className="bg-primary text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </button>
    );
};

export default ModeCard;
