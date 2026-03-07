const ColorSwatch = ({ hex, label }) => {
    return (
        <div className="flex flex-col items-center space-y-2">
            <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg border-4 border-white"
                style={{ backgroundColor: hex }}
            />
            <span className="text-xs md:text-sm font-mono text-gray-400">
                {hex}
            </span>
            {label && (
                <span className="text-xs text-muted capitalize">
                    {label}
                </span>
            )}
        </div>
    );
};

export default ColorSwatch;
