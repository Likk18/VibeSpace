import { useState, useEffect } from 'react';

const WeightSlider = ({ memberCount = 2, mode, onChange }) => {
    const [weights, setWeights] = useState([]);

    useEffect(() => {
        const initialWeights = initializeWeights(memberCount, mode);
        setWeights(initialWeights);
        onChange(initialWeights);
    }, [memberCount, mode]);

    const initializeWeights = (count, mode) => {
        if (mode === 'partner') {
            return [0.6, 0.4];
        }
        const equalWeight = 1 / count;
        return Array(count).fill(equalWeight);
    };

    const handleSliderChange = (index, newValue) => {
        const newWeights = [...weights];
        const oldValue = newWeights[index];
        newWeights[index] = parseFloat(newValue);

        const diff = oldValue - newWeights[index];
        const otherIndices = newWeights.map((_, i) => i).filter(i => i !== index);
        
        if (otherIndices.length > 0) {
            const distributeAmount = diff / otherIndices.length;
            otherIndices.forEach(i => {
                newWeights[i] = Math.max(0.05, newWeights[i] + distributeAmount);
            });
        }

        const total = newWeights.reduce((a, b) => a + b, 0);
        const normalized = newWeights.map(w => Math.round((w / total) * 100) / 100);
        
        setWeights(normalized);
        onChange(normalized);
    };

    const getLabel = (index) => {
        if (mode === 'partner') {
            return index === 0 ? 'You' : 'Partner';
        }
        return `Person ${index + 1}`;
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-surface rounded-xl">
            <label className="block text-center text-sm font-medium text-gray-300 mb-4">
                Adjust preference weights
            </label>

            <div className="space-y-4">
                {weights.map((weight, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-gray-400">{getLabel(index)}</span>
                        <input
                            type="range"
                            min="0.05"
                            max="0.95"
                            step="0.05"
                            value={weight}
                            onChange={(e) => handleSliderChange(index, e.target.value)}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="w-12 text-right text-sm font-medium text-primary">
                            {Math.round(weight * 100)}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
                <span>Equal: </span>
                <button 
                    onClick={() => {
                        const equal = initializeWeights(memberCount, mode);
                        setWeights(equal);
                        onChange(equal);
                    }}
                    className="text-primary hover:underline"
                >
                    Reset to equal
                </button>
            </div>
        </div>
    );
};

export default WeightSlider;
