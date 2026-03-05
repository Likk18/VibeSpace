import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (exclude password)
            req.user = await User.findById(decoded.id).select('-password_hash');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found - token invalid'
                });
            }

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized - token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - no token provided'
        });
    }
};

/**
 * Middleware to check if user has completed quiz
 */
export const requireQuizComplete = async (req, res, next) => {
    if (!req.user.quiz_complete) {
        return res.status(403).json({
            success: false,
            message: 'Please complete the style quiz first'
        });
    }
    next();
};
