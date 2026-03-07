const TextureCard = ({ image_url, material_tag }) => {
    return (
        <div className="relative group overflow-hidden rounded-lg shadow-md">
            <img
                src={image_url}
                alt={material_tag}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="text-white text-sm font-medium capitalize">
                    {material_tag}
                </span>
            </div>
        </div>
    );
};

export default TextureCard;
