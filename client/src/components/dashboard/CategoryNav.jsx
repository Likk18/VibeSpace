import { Link } from 'react-router-dom';

const categories = [
    { id: 1, name: 'Living Room', path: '/category/living-room' },
    { id: 2, name: 'Bedroom', path: '/category/bedroom' },
    { id: 3, name: 'Dining', path: '/category/dining' },
    { id: 4, name: 'Kitchen', path: '/category/kitchen' },
    { id: 5, name: 'Decor', path: '/category/decor' },
    { id: 6, name: 'Lighting', path: '/category/lighting' },
    { id: 7, name: 'Outdoor', path: '/category/outdoor' },
    { id: 8, name: 'Sale', path: '/category/sale', isHighlight: true }
];

const CategoryNav = () => {
    return (
        <div className="bg-[#232F3E] text-white text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.path}
                        className={`hover:border-white border border-transparent px-2 py-1 rounded-sm transition-colors ${
                            category.isHighlight ? 'text-[#F3A847] font-bold hover:text-[#F3A847]' : 'text-gray-200'
                        }`}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav;
