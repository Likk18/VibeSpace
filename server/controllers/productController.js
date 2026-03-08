import Product from '../models/Product.js';
import UserStyleProfile from '../models/UserStyleProfile.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import User from '../models/User.js';
import { calculateMatchScore } from '../utils/recommendations.js';
import logger from '../utils/logger.js';

/**
 * @route   GET /api/products/feed
 * @desc    Get personalized product feed
 * @access  Private
 */
export const getProductFeed = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetProductFeed request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // If personalization is OFF, return full catalog
        if (!user.personalization_on) {
            const products = await Product.find({ in_stock: true })
                .sort({ rating: -1 })
                .limit(20);

            return res.json({
                success: true,
                personalized: false,
                count: products.length,
                data: { products }
            });
        }

        // Get profile
        let profile;
        if (user.mode === 'group' && user.group_id) {
            profile = await GroupStyleProfile.findOne({ group_id: user.group_id });
            if (!profile) {
                profile = await UserStyleProfile.findOne({ user_id: userId });
            }
        } else {
            profile = await UserStyleProfile.findOne({ user_id: userId });
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Complete quiz first.'
            });
        }

        // Get products matching style tags
        const products = await Product.find({
            style_tags: { $in: [profile.primary_style, profile.secondary_style].filter(Boolean) },
            in_stock: true
        });

        // Calculate match scores
        const scoredProducts = products.map(product => ({
            ...product.toObject(),
            matchScore: calculateMatchScore(product, profile)
        }));

        // Sort by match score
        scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            personalized: true,
            count: scoredProducts.length,
            data: {
                products: scoredProducts.slice(0, 20),
                profile: {
                    style_label: profile.style_label,
                    primary_style: profile.primary_style
                }
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetProductFeed failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetProduct request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetProduct failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
export const searchProducts = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] SearchProducts request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { q, category, minPrice, maxPrice, color, material } = req.query;

        const query = { in_stock: true };

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (color) query.color_tag = color;
        if (material) query.material_tag = material;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.find(query).limit(50);

        res.json({
            success: true,
            count: products.length,
            data: { products }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] SearchProducts failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetCategories request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const categories = await Product.distinct('category');

        res.json({
            success: true,
            count: categories.length,
            data: { categories }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetCategories failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
