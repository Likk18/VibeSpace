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
        const feedMode = req.query.feed_mode || 'personal';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        
        const user = await User.findById(userId);

        if (!user.personalization_on) {
            const total = await Product.countDocuments({ in_stock: true });
            const products = await Product.find({ in_stock: true })
                .sort({ rating: -1 })
                .skip(skip)
                .limit(limit);

            return res.json({
                success: true,
                personalized: false,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total
                },
                count: products.length,
                data: { products }
            });
        }

        let profile;
        const isGroupMode = user.mode === 'group' && user.group_id;

        if (isGroupMode) {
            if (feedMode === 'group') {
                profile = await GroupStyleProfile.findOne({ group_id: user.group_id });
            }
            if (!profile && feedMode === 'personal') {
                profile = await UserStyleProfile.findOne({ user_id: userId });
            }
            if (!profile) {
                profile = await GroupStyleProfile.findOne({ group_id: user.group_id }) || 
                          await UserStyleProfile.findOne({ user_id: userId });
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

        const styleTags = [profile.primary_style, profile.secondary_style].filter(Boolean);
        
        if (profile.raw_scores && Object.keys(profile.raw_scores).length > 0) {
            const topStyles = Object.entries(profile.raw_scores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([style]) => style);
            styleTags.push(...topStyles);
        }

        const query = {
            style_tags: { $in: [...new Set(styleTags)] },
            in_stock: true
        };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .skip(skip)
            .limit(limit);

        const scoredProducts = products.map(product => ({
            ...product.toObject(),
            matchScore: calculateMatchScore(product, profile)
        }));

        scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            personalized: true,
            feed_mode: feedMode,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            },
            count: scoredProducts.length,
            data: {
                products: scoredProducts,
                profile: {
                    style_label: profile.style_label,
                    primary_style: profile.primary_style,
                    secondary_style: profile.secondary_style
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
        const { 
            q, 
            category, 
            minPrice, 
            maxPrice, 
            color, 
            material,
            designer,
            page = 1,
            limit = 12
        } = req.query;

        const query = { in_stock: true };
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) {
            const categories = category.split(',').map(c => c.trim());
            query.category = categories.length === 1 ? category : { $in: categories };
        }

        if (color) {
            const colors = color.split(',').map(c => c.trim());
            query.color_tag = colors.length === 1 ? color : { $in: colors };
        }

        if (material) {
            const materials = material.split(',').map(m => m.trim());
            query.material_tag = materials.length === 1 ? material : { $in: materials };
        }

        if (designer) {
            const designers = designer.split(',').map(d => d.trim());
            query.designer = designers.length === 1 ? designer : { $in: designers };
        }

        // New Arrivals filter — products created in the last 30 days
        if (req.query.newArrivals === 'true') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: thirtyDaysAgo };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ rating: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: pageNum * limitNum < total
            },
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

/**
 * @route   GET /api/products/filters
 * @desc    Get all filter options (colors, materials, designers)
 * @access  Public
 */
export const getFilterOptions = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetFilterOptions request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const [colors, materials, designers] = await Promise.all([
            Product.distinct('color_tag'),
            Product.distinct('material_tag'),
            Product.distinct('designer')
        ]);

        res.json({
            success: true,
            data: {
                colors: colors.filter(Boolean).sort(),
                materials: materials.filter(Boolean).sort(),
                designers: designers.filter(Boolean).sort()
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetFilterOptions failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
