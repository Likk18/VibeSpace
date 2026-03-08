import Asset from '../models/Asset.js';
import Product from '../models/Product.js';
import UserStyleProfile from '../models/UserStyleProfile.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * @route   GET /api/moodboard/generate
 * @desc    Generate mood board from user profile
 * @access  Private
 */
export const generateMoodBoard = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GenerateMoodBoard request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Get appropriate profile (group or individual)
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

        // Fetch room inspiration images (6 total, show 3)
        const roomAssets = await Asset.find({
            type: 'room',
            style: profile.primary_style
        }).limit(6);

        // Fetch texture images (4 total, show 2)
        const textureAssets = await Asset.find({
            type: 'texture',
            material_tag: profile.dominant_material
        }).limit(4);

        // Get color palette from profile
        const palette = profile.color_palette;

        // Fetch products with tag matching
        const products = await Product.aggregate([
            {
                $match: {
                    style_tags: { $in: [profile.primary_style, profile.secondary_style].filter(Boolean) },
                    in_stock: true
                }
            },
            {
                $addFields: {
                    matchScore: {
                        $size: {
                            $setIntersection: [
                                '$style_tags',
                                [profile.primary_style, profile.secondary_style].filter(Boolean)
                            ]
                        }
                    }
                }
            },
            { $sort: { matchScore: -1, rating: -1 } },
            { $limit: 8 }
        ]);

        res.json({
            success: true,
            data: {
                palette,
                textures: textureAssets.slice(0, 2),
                inspiration: roomAssets.slice(0, 3),
                products: products.slice(0, 4),
                pool: {
                    textures: textureAssets,
                    inspiration: roomAssets,
                    products
                }
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GenerateMoodBoard failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/moodboard/regenerate
 * @desc    Regenerate mood board (shuffle pool)
 * @access  Private
 */
export const regenerateMoodBoard = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] RegenerateMoodBoard request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { pool } = req.body;

        // Shuffle and return new selections
        const shuffleArray = (arr) => {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        const shuffledInspiration = shuffleArray(pool.inspiration);
        const shuffledProducts = shuffleArray(pool.products);

        res.json({
            success: true,
            data: {
                inspiration: shuffledInspiration.slice(0, 3),
                products: shuffledProducts.slice(0, 4),
                // Keep textures stable
                textures: pool.textures.slice(0, 2)
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] RegenerateMoodBoard failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
