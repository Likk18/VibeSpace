import { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [savedCards, setSavedCards] = useState([]);
    const [savedUpis, setSavedUpis] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.quiz_complete) {
            fetchProfile();
        }
    }, [user?.id, user?.quiz_complete]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await profileAPI.getMyProfile();
            setProfile(response.data.data.profile);
            setCart(response.data.data.cart || []);
            setWishlist(response.data.data.wishlist || []);
            setAddresses(response.data.data.addresses || []);
            setSavedCards(response.data.data.saved_cards || []);
            setSavedUpis(response.data.data.saved_upis || []);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePersonalization = async () => {
        try {
            const newValue = !user.personalization_on;
            await profileAPI.togglePersonalization(newValue);
            updateUser({ personalization_on: newValue });
            return newValue;
        } catch (error) {
            console.error('Failed to toggle personalization:', error);
            throw error;
        }
    };

    const mergeProfiles = async () => {
        try {
            const response = await profileAPI.mergeProfiles();
            setProfile(response.data.data.profile);
            return response.data.data.profile;
        } catch (error) {
            console.error('Failed to merge profiles:', error);
            throw error;
        }
    };

    const addToCart = async (productId) => {
        try {
            const response = await profileAPI.addToCart(productId);
            setCart(response.data.data.cart);
            return response.data;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await profileAPI.removeFromCart(productId);
            setCart(response.data.data.cart);
            return response.data;
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            throw error;
        }
    };

    const addToWishlist = async (productId, folder) => {
        try {
            const response = await profileAPI.addToWishlist(productId, folder);
            setWishlist(response.data.data.wishlist);
            return response.data;
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            throw error;
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const response = await profileAPI.removeFromWishlist(productId);
            setWishlist(response.data.data.wishlist);
            return response.data;
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            throw error;
        }
    };

    const addAddress = async (addressData) => {
        try {
            const response = await profileAPI.addAddress(addressData);
            setAddresses(response.data.data.addresses);
            return response.data;
        } catch (error) {
            console.error('Failed to add address:', error);
            throw error;
        }
    };

    const deleteAddress = async (addressId) => {
        try {
            const response = await profileAPI.deleteAddress(addressId);
            setAddresses(response.data.data.addresses);
            return response.data;
        } catch (error) {
            console.error('Failed to delete address:', error);
            throw error;
        }
    };

    const saveCard = async (cardData) => {
        try {
            const response = await profileAPI.saveCard(cardData);
            setSavedCards(response.data.data.saved_cards);
            return response.data;
        } catch (error) {
            console.error('Failed to save card:', error);
            throw error;
        }
    };

    const saveUpi = async (upiData) => {
        try {
            const response = await profileAPI.saveUpi(upiData);
            setSavedUpis(response.data.data.saved_upis);
            return response.data;
        } catch (error) {
            console.error('Failed to save UPI:', error);
            throw error;
        }
    };

    const value = {
        profile,
        cart,
        wishlist,
        loading,
        fetchProfile,
        togglePersonalization,
        mergeProfiles,
        personalizationOn: user?.personalization_on ?? true,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        addresses,
        addAddress,
        deleteAddress,
        savedCards,
        savedUpis,
        saveCard,
        saveUpi
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
