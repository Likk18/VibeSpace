import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] Register request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { name, email, password, mode, group_id } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password_hash,
            mode: mode || 'single',
            group_id: group_id || null
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mode: user.mode,
                    quiz_complete: user.quiz_complete
                },
                token
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] Register failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] Login request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { email, password } = req.body;

        // Find user (include password for verification)
        const user = await User.findOne({ email }).select('+password_hash');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mode: user.mode,
                    group_id: user.group_id,
                    quiz_complete: user.quiz_complete,
                    personalization_on: user.personalization_on
                },
                token
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] Login failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetMe request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mode: user.mode,
                    group_id: user.group_id,
                    quiz_complete: user.quiz_complete,
                    personalization_on: user.personalization_on
                }
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetMe failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
