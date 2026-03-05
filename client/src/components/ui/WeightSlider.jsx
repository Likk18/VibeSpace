import { useState } from 'react';
import { WEIGHT_OPTIONS } from '../../utils/constants';

const WeightSlider = ({ onChange }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleChange = (index) => {
        setSelectedIndex(index);
        onChange(WEIGHT_OPTIONS[index].value);
    };

    return (
        <div className="max-w-md mx-auto">
            <label className="block text-center text-sm font-medium text-gray-300 mb-4">
                Whose preference leads?
            </label>

            <div className="relative">
                {/* Slider Track */}
                <div className="flex justify-between items-center mb-2">
                    {WEIGHT_OPTIONS.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleChange(index)}
                            className={`
                flex-1 mx-1 py-3 rounded-lg font-medium text-sm transition-all
                ${selectedIndex === index
                                    ? 'bg-primary text-white shadow-lg scale-105'
                                    : 'bg-surface text-gray-400 hover:bg-gray-200'
                                }
              `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Description */}
                <p className="text-center text-xs text-muted mt-2">
                    {WEIGHT_OPTIONS[selectedIndex].description}
                </p>
            </div>
        </div>
    );
};

export default WeightSlider;
