import UserStyleProfile from '../models/UserStyleProfile.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { mergeGroupProfiles } from '../utils/merging.js';
import logger from '../utils/logger.js';

/**
 * @route   POST /api/profile/merge
 * @desc    Merge group member profiles
 * @access  Private
 */
export const mergeProfiles = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] MergeProfiles request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] MergeProfiles failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's style profile
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetMyProfile request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .populate('cart')
            .populate('wishlist.product');

        // Filter out stale references (deleted products populate as null)
        const validCart = (user.cart || []).filter(item => item != null);
        const validWishlist = (user.wishlist || []).filter(item => item.product != null);

        // Clean up stale entries in DB if any were found
        const cartChanged = validCart.length !== (user.cart || []).length;
        const wishlistChanged = validWishlist.length !== (user.wishlist || []).length;
        if (cartChanged || wishlistChanged) {
            user.cart = validCart.map(p => p._id);
            user.wishlist = validWishlist.map(item => ({
                product: item.product._id,
                folder: item.folder,
                added_at: item.added_at
            }));
            await user.save();
        }

        let profile;
        let groupProfile = null;

        if (user.mode === 'group' && user.group_id) {
            groupProfile = await GroupStyleProfile.findOne({ group_id: user.group_id });
            profile = await UserStyleProfile.findOne({ user_id: userId });
        } else {
            profile = await UserStyleProfile.findOne({ user_id: userId });
        }

        if (!profile && !groupProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete the quiz first.'
            });
        }

        res.json({
            success: true,
            data: {
                profile: profile || groupProfile,
                group_profile: groupProfile,
                cart: validCart,
                wishlist: validWishlist,
                addresses: user.addresses,
                saved_cards: user.saved_cards || [],
                saved_upis: user.saved_upis || []
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetMyProfile failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   PUT /api/profile/toggle
 * @desc    Toggle personalization on/off
 * @access  Private
 */
export const togglePersonalization = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] TogglePersonalization request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] TogglePersonalization failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/cart
 * @desc    Add item to cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] AddToCart request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { productId } = req.body;

        const user = await User.findById(req.user.id);

        // Push to cart array, allowing duplicates to act as quantity
        user.cart.push(productId);
        await user.save();

        // Populate cart for response
        await user.populate('cart');

        res.json({
            success: true,
            message: 'Item added to cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] AddToCart failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   DELETE /api/profile/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] RemoveFromCart request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        const index = user.cart.findIndex(id => id.toString() === productId);
        if (index !== -1) {
            user.cart.splice(index, 1);
            await user.save();
        }

        await user.populate('cart');

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] RemoveFromCart failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/wishlist
 * @desc    Add item to wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] AddToWishlist request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] AddToWishlist failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   DELETE /api/profile/wishlist/:productId
 * @desc    Remove item from wishlist
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] RemoveFromWishlist request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] RemoveFromWishlist failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/address
 * @desc    Add a new address
 * @access  Private
 */
export const addAddress = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] AddAddress request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const user = await User.findById(req.user.id);
        const newAddress = req.body;
        
        if (newAddress.is_default) {
            user.addresses.forEach(addr => addr.is_default = false);
        }
        
        user.addresses.push(newAddress);
        await user.save();
        
        res.json({
            success: true,
            message: 'Address added successfully',
            data: { addresses: user.addresses }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] AddAddress failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   DELETE /api/profile/address/:addressId
 * @desc    Delete an address
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] DeleteAddress request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.json({
            success: true,
            message: 'Address removed',
            data: { addresses: user.addresses }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] DeleteAddress failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/saved-card
 * @desc    Save a card for future payments
 * @access  Private
 */
export const saveCard = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] SaveCard request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { last4, brand, holder_name } = req.body;
        const user = await User.findById(req.user.id);

        // Check if card already saved
        const exists = user.saved_cards.some(c => c.last4 === last4);
        if (!exists) {
            user.saved_cards.push({ last4, brand: brand || 'Visa', holder_name: holder_name || '' });
            await user.save();
        }

        res.json({
            success: true,
            message: 'Card saved successfully',
            data: { saved_cards: user.saved_cards }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] SaveCard failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/saved-upi
 * @desc    Save a UPI ID for future payments
 * @access  Private
 */
export const saveUpi = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] SaveUpi request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { upi_id, bank_name } = req.body;
        const user = await User.findById(req.user.id);

        // Check if UPI already saved
        const exists = user.saved_upis.some(u => u.upi_id === upi_id);
        if (!exists) {
            user.saved_upis.push({ upi_id, bank_name: bank_name || 'UPI' });
            await user.save();
        }

        res.json({
            success: true,
            message: 'UPI saved successfully',
            data: { saved_upis: user.saved_upis }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] SaveUpi failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/profile/wallet/add
 * @desc    Add money to VibePay wallet
 * @access  Private
 */
export const addMoney = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] AddMoney request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { amount } = req.body;
        const addAmount = parseFloat(amount);

        if (!addAmount || addAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
        }
        if (addAmount > 10000) {
            return res.status(400).json({ success: false, message: 'Maximum add limit is $10,000' });
        }

        const user = await User.findById(req.user.id);
        const newBalance = (user.vibepay_balance || 0) + addAmount;

        if (newBalance > 10000) {
            return res.status(400).json({ success: false, message: `Cannot exceed $10,000 wallet limit. Current balance: $${user.vibepay_balance.toFixed(2)}` });
        }

        user.vibepay_balance = newBalance;
        await user.save();

        res.json({
            success: true,
            message: `$${addAmount.toFixed(2)} added to VibePay wallet`,
            data: { vibepay_balance: user.vibepay_balance }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] AddMoney failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/profile/group-report
 * @desc    Get group report with merged + individual profiles
 * @access  Private
 */
export const getGroupReport = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetGroupReport request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.group_id) {
            return res.status(400).json({
                success: false,
                message: 'User is not in a group'
            });
        }

        const group = await Group.findById(user.group_id);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const groupProfile = await GroupStyleProfile.findOne({ group_id: group._id });
        
        if (!groupProfile) {
            return res.status(404).json({
                success: false,
                message: 'Group profile not found. Complete all member quizzes first.'
            });
        }

        const memberProfiles = await UserStyleProfile.find({
            user_id: { $in: group.member_ids }
        });

        const membersData = await User.find({ _id: { $in: group.member_ids } });

        const individualProfiles = memberProfiles.map(profile => {
            const member = membersData.find(m => m._id.toString() === profile.user_id.toString());
            return {
                name: member?.name || 'Member',
                style_label: profile.style_label,
                primary_style: profile.primary_style,
                secondary_style: profile.secondary_style,
                color_palette: profile.color_palette,
                dominant_color: profile.dominant_color
            };
        });

        const weights = Object.fromEntries(group.weights);

        res.json({
            success: true,
            data: {
                group: {
                    style_label: groupProfile.style_label,
                    primary_style: groupProfile.primary_style,
                    secondary_style: groupProfile.secondary_style,
                    color_palette: groupProfile.color_palette,
                    dominant_color: groupProfile.dominant_color,
                    raw_scores: groupProfile.raw_scores,
                    weights_applied: weights
                },
                members: individualProfiles,
                member_count: group.member_ids.length
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetGroupReport failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
