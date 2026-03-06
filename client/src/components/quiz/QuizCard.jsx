import { useState } from 'react';

/**
 * Map style tags to display-friendly vibe names
 */
const VIBE_LABELS = {
    'bohemian': 'Bohemian',
    'industrial': 'Industrial',
    'maximalist': 'Maximalist',
    'minimalist': 'Minimalist',
    'modern-luxury': 'Modern Luxury',
    'scandinavian': 'Scandinavian',
    'traditional': 'Traditional'
};

const QuizCard = ({ question, onSelect, selectedOption }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="max-w-5xl mx-auto">
            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-display text-center mb-8 text-balance">
                {question.question_text}
            </h2>

            {/* Image Grid - 2x3 responsive grid for 6 options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                {question.image_options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(option)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`
              relative aspect-square rounded-xl overflow-hidden
              transition-all duration-300 transform
              ${selectedOption === index
                                ? 'ring-4 ring-primary scale-[0.98]'
                                : 'ring-2 ring-gray-200/20 hover:ring-primary/50 hover:scale-[1.02]'
                            }
              ${hoveredIndex === index ? 'shadow-2xl shadow-primary/20' : 'shadow-md'}
            `}
                    >
                        <img
                            src={option.image_url}
                            alt={`${VIBE_LABELS[option.style_tag] || option.style_tag} option`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />

                        {/* Hover Vibe Label */}
                        <div className={`
              absolute bottom-0 left-0 right-0 p-2
              bg-gradient-to-t from-black/80 to-transparent
              transition-opacity duration-200
              ${hoveredIndex === index || selectedOption === index ? 'opacity-100' : 'opacity-0'}
            `}>
                            <span className="text-xs font-medium text-white/90">
                                {VIBE_LABELS[option.style_tag] || option.style_tag}
                            </span>
                        </div>

                        {/* Selected Overlay */}
                        {selectedOption === index && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-surface rounded-full p-3">
                                    <svg
                                        className="w-8 h-8 text-primary"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
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
                ))}
            </div>
        </div>
    );
};

export default QuizCard;
