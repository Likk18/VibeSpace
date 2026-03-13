const InspirationGrid = ({ images }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
                <div
                    key={index}
                    className="relative overflow-hidden rounded-xl shadow-lg group"
                >
                    <img
                        src={image.image_url}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            ))}
        </div>
    );
};

export default InspirationGrid;
