import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Registration validation rules
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('mode')
        .notEmpty().withMessage('Mode is required')
        .isIn(['single', 'group']).withMessage('Mode must be single or group')
];

/**
 * Login validation rules
 */
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];

/**
 * Quiz submission validation
 */
export const quizSubmitValidation = [
    body('responses')
        .isArray({ min: 1 }).withMessage('Must provide at least 1 response'),

    body('responses.*.questionId')
        .notEmpty().withMessage('Question ID is required'),

    body('responses.*.selectedStyle')
        .optional({ nullable: true })
        .isString().withMessage('Selected style must be a string'),

    body('responses.*.selectedColor')
        .optional({ nullable: true })
        .isString().withMessage('Selected color must be a string'),

    body('responses.*.selectedMaterial')
        .optional({ nullable: true })
        .isString().withMessage('Selected material must be a string')
];
