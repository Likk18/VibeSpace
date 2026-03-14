import { Link } from 'react-router-dom';

const categories = [
    { id: 1, name: 'Living Room', path: '/dashboard?category=Living Room' },
    { id: 2, name: 'Bedroom', path: '/dashboard?category=Bedroom' },
    { id: 3, name: 'Dining', path: '/dashboard?category=Dining' },
    { id: 4, name: 'Kitchen', path: '/dashboard?category=Kitchen' },
    { id: 5, name: 'Decor', path: '/dashboard?category=Decor' },
    { id: 6, name: 'Lighting', path: '/dashboard?category=Lighting' },
    { id: 7, name: 'Outdoor', path: '/dashboard?category=Outdoor' },
    { id: 8, name: 'Sale', path: '/dashboard?filter=sale', isHighlight: true }
];

const CategoryNav = () => {
    return (
        <div className="bg-[#3D1F0D] text-white text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.path}
                        className={`hover:border-white border border-transparent px-2 py-1 rounded-sm transition-colors ${
                            category.isHighlight ? 'text-[#C4956A] font-bold hover:text-[#C4956A]' : 'text-[#F5EFE6]'
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
