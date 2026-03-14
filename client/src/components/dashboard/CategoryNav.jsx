import { Link } from 'react-router-dom';

const categories = [
    { id: 1, name: 'Bathroom', path: '/dashboard?category=Bathroom' },
    { id: 2, name: 'Bedroom', path: '/dashboard?category=Bedroom' },
    { id: 3, name: 'Children', path: '/dashboard?category=Children' },
    { id: 4, name: 'Decoration & Art', path: '/dashboard?category=Decoration & Art' },
    { id: 5, name: 'Dining Room', path: '/dashboard?category=Dining Room' },
    { id: 6, name: 'Hallway', path: '/dashboard?category=Hallway' },
    { id: 7, name: 'Home Office', path: '/dashboard?category=Home Office' },
    { id: 8, name: 'Kitchen', path: '/dashboard?category=Kitchen' },
    { id: 9, name: 'Laundry & Cleaning', path: '/dashboard?category=Laundry & Cleaning' },
    { id: 10, name: 'Living Room', path: '/dashboard?category=Living Room' },
    { id: 11, name: 'Wardrobe & Storage', path: '/dashboard?category=Wardrobe & Storage' }
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
