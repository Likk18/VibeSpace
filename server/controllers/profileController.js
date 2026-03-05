import UserStyleProfile from '../models/UserStyleProfile.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { mergeGroupProfiles } from '../utils/merging.js';

/**
 * @route   POST /api/profile/merge
 * @desc    Merge group member profiles
 * @access  Private
 */
export const mergeProfiles = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.group_id) {
            return res.status(400).json({
                success: false,
                message: 'User is not in a group'
            });
        }

        const group = await Group.findById(user.group_id).populate('member_ids');

        // Check if all members completed quiz
        const allComplete = group.member_ids.every(member => member.quiz_complete);

        if (!allComplete) {
            return res.status(400).json({
                success: false,
                message: 'Not all group members have completed the quiz'
            });
        }

        // Get all member profiles
        const memberProfiles = await UserStyleProfile.find({
            user_id: { $in: group.member_ids.map(m => m._id) }
        });

        // Convert weights Map to object
        const weightsObj = Object.fromEntries(group.weights);

        // Merge profiles
        const mergedData = mergeGroupProfiles(memberProfiles, weightsObj);

        // Create or update group profile
        let groupProfile = await GroupStyleProfile.findOne({ group_id: group._id });

        if (groupProfile) {
            // Update existing
            Object.assign(groupProfile, {
                ...mergedData,
                merged_from: memberProfiles.map(p => p._id),
                weights_applied: weightsObj
            });
            await groupProfile.save();
        } else {
            // Create new
            groupProfile = await GroupStyleProfile.create({
                group_id: group._id,
                ...mergedData,
                merged_from: memberProfiles.map(p => p._id),
                weights_applied: weightsObj
            });
        }

        // Mark group merge as complete
        group.merge_complete = true;
        await group.save();

        res.json({
            success: true,
            message: 'Profiles merged successfully',
            data: {
                profile: {
                    style_label: groupProfile.style_label,
                    primary_style: groupProfile.primary_style,
                    secondary_style: groupProfile.secondary_style,
                    dominant_color: groupProfile.dominant_color,
                    dominant_material: groupProfile.dominant_material,
                    color_palette: groupProfile.color_palette
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's style profile
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        let profile;

        if (user.mode === 'group' && user.group_id) {
            // Try to get group profile first
            profile = await GroupStyleProfile.findOne({ group_id: user.group_id });

            // Fallback to individual profile if group not merged yet
            if (!profile) {
                profile = await UserStyleProfile.findOne({ user_id: userId });
            }
        } else {
            profile = await UserStyleProfile.findOne({ user_id: userId });
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete the quiz first.'
            });
        }

        res.json({
            success: true,
            data: {
                profile,
                cart: user.cart,
                wishlist: user.wishlist
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/profile/toggle
 * @desc    Toggle personalization on/off
 * @access  Private
 */
export const togglePersonalization = async (req, res, next) => {
    try {
        const { personalization_on } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { personalization_on },
            { new: true }
        );

        res.json({
            success: true,
            message: `Personalization turned ${personalization_on ? 'ON' : 'OFF'}`,
            data: {
                personalization_on: user.personalization_on
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/profile/cart
 * @desc    Add item to cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.body;

        const user = await User.findById(req.user.id);

        // Check if already in cart
        if (!user.cart.includes(productId)) {
            user.cart.push(productId);
            await user.save();
        }

        // Populate cart for response
        await user.populate('cart');

        res.json({
            success: true,
            message: 'Item added to cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/profile/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(id => id.toString() !== productId);
        await user.save();

        await user.populate('cart');

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/profile/wishlist
 * @desc    Add item to wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
    try {
        const { productId, folder } = req.body;

        const user = await User.findById(req.user.id);

        // Check if already in wishlist
        const existingIndex = user.wishlist.findIndex(item => item.product.toString() === productId);

        if (existingIndex !== -1) {
            // Update folder if it exists
            user.wishlist[existingIndex].folder = folder || 'General';
        } else {
            user.wishlist.push({
                product: productId,
                folder: folder || 'General'
            });
        }

        await user.save();
        await user.populate('wishlist.product');

        res.json({
            success: true,
            message: 'Item saved to wishlist',
            data: { wishlist: user.wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/profile/wishlist/:productId
 * @desc    Remove item from wishlist
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
        await user.save();

        await user.populate('wishlist.product');

        res.json({
            success: true,
            message: 'Item removed from wishlist',
            data: { wishlist: user.wishlist }
        });
    } catch (error) {
        next(error);
    }
};
