import { useState } from 'react';

const QuizCard = ({ question, onSelect, selectedOption }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-display text-center mb-8 text-balance">
                {question.question_text}
            </h2>

            {/* Image Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
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
                                : 'ring-2 ring-gray-200 hover:ring-primary/50 hover:scale-[1.02]'
                            }
              ${hoveredIndex === index ? 'shadow-2xl' : 'shadow-md'}
            `}
                    >
                        <img
                            src={option.image_url}
                            alt={`Option ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />

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
