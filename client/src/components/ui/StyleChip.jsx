const StyleChip = ({ style, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2'
    };

    return (
        <span className={`style-chip ${sizeClasses[size]} capitalize`}>
            {style.replace('-', ' ')}
        </span>
    );
};

export default StyleChip;
