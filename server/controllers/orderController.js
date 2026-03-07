import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { items, total_amount, shipping_address, payment_method } = req.body;

        // Generate a unique order ID
        const order_id = Math.random().toString(36).substr(2, 9).toUpperCase();

        const order = await Order.create({
            user: userId,
            items,
            total_amount,
            shipping_address,
            payment_method,
            order_id
        });

        // Extract ordered product IDs
        const orderedProductIds = items.map(item => item.product);

        // Remove these items from user's cart and wishlist
        await User.findByIdAndUpdate(userId, { 
            $pull: { 
                cart: { $in: orderedProductIds },
                wishlist: { product: { $in: orderedProductIds } }
            }
        });

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the logged-in user
 * @access  Private
 */
export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }) // Newest first
            .populate('items.product', 'name price image_url');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};
