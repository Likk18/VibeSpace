import { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI, groupAPI } from '../services/api';
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
    const [groupProfile, setGroupProfile] = useState(null);
    const [groupStatus, setGroupStatus] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedMode, setFeedMode] = useState('personal');

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user?._id, user?.quiz_complete]);

    useEffect(() => {
        if (user?.mode === 'group' && user?.group_id) {
            fetchGroupStatus();
        }
    }, [user?.group_id, user?.mode]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await profileAPI.getMyProfile();
            setProfile(response.data.data.profile);
            setGroupProfile(response.data.data.group_profile || null);
            setCart(response.data.data.cart || []);
            setWishlist(response.data.data.wishlist || []);
            setAddresses(response.data.data.addresses || []);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupStatus = async () => {
        if (!user?.group_id) return;
        try {
            const response = await groupAPI.getStatus(user.group_id);
            setGroupStatus(response.data.data);
        } catch (error) {
            console.error('Failed to fetch group status:', error);
        }
    };

    const isGroupComplete = () => {
        if (!groupStatus) return false;
        return groupStatus.all_complete === true;
    };

    const getGroupMemberCount = () => {
        if (!groupStatus?.group) return 0;
        return groupStatus.group.member_count;
    };

    const getCompletedMemberCount = () => {
        if (!groupStatus?.members) return 0;
        return groupStatus.members.filter(m => m.quiz_complete).length;
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

    const value = {
        profile,
        groupProfile,
        groupStatus,
        cart,
        wishlist,
        loading,
        fetchProfile,
        fetchGroupStatus,
        isGroupComplete,
        getGroupMemberCount,
        getCompletedMemberCount,
        togglePersonalization,
        mergeProfiles,
        personalizationOn: user?.personalization_on ?? true,
        feedMode,
        setFeedMode,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        addresses,
        addAddress,
        deleteAddress
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
