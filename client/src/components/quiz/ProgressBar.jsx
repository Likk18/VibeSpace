const ProgressBar = ({ current, total }) => {
    const percentage = (current / total) * 100;

    return (
        <div className="w-full mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">
                    Question {current} of {total}
                </span>
                <span className="text-sm text-muted">
                    {Math.round(percentage)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
