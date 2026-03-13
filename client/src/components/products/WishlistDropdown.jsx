import { useState, useRef, useEffect } from 'react';
import './WishlistDropdown.css';

const WishlistDropdown = ({ productId, onAdd, wishlist }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newFolder, setNewFolder] = useState('');
    const dropdownRef = useRef(null);

    // Filter unique folder names from current wishlist
    const folders = wishlist ? [...new Set(wishlist.map(item => item.folder || 'General'))] : ['General'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="wishlist-dropdown" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className="wishlist-trigger-btn"
                title="Save to Wishlist"
            >
                <svg
                    className={`w-5 h-5 ${wishlist && wishlist.some(w => w.product === productId || w.product?._id === productId) ? 'text-red-500' : 'text-gray-300'}`}
                    fill={wishlist && wishlist.some(w => w.product === productId || w.product?._id === productId) ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="wishlist-menu animate-in fade-in zoom-in duration-200">
                    <div className="wishlist-menu-header">Save to Folder</div>
                    <div className="wishlist-menu-items">
                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await onAdd(productId, folder);
                                    setIsOpen(false);
                                }}
                                className="wishlist-menu-item"
                            >
                                <span className="wishlist-item-name">{folder}</span>
                                <span className="wishlist-item-plus">+</span>
                            </button>
                        ))}
                    </div>
                    <div className="wishlist-menu-divider"></div>
                    <div className="wishlist-new-folder">
                        <input
                            type="text"
                            placeholder="New folder..."
                            value={newFolder}
                            onChange={(e) => setNewFolder(e.target.value)}
                            onClick={(e) => e.preventDefault()}
                            className="wishlist-new-input"
                        />
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!newFolder.trim()) return;
                                await onAdd(productId, newFolder.trim());
                                setNewFolder('');
                                setIsOpen(false);
                            }}
                            className="wishlist-add-btn"
                        >
                            Add +
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistDropdown;
