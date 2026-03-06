import QuizQuestion from '../models/QuizQuestion.js';
import UserResponse from '../models/UserResponse.js';
import UserStyleProfile from '../models/UserStyleProfile.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { calculateStyleProfile } from '../utils/scoring.js';

/**
 * @route   GET /api/quiz/questions
 * @desc    Get all quiz questions
 * @access  Private
 */
export const getQuestions = async (req, res, next) => {
    try {
        const questions = await QuizQuestion.find()
            .sort({ question_number: 1 })
            .select('-__v');

        res.json({
            success: true,
            count: questions.length,
            data: { questions }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/quiz/submit
 * @desc    Submit quiz responses and generate style profile
 * @access  Private
 */
export const submitQuiz = async (req, res, next) => {
    try {
        const { responses } = req.body;
        const userId = req.user.id;

        // Check if user already submitted
        const existingResponse = await UserResponse.findOne({ user_id: userId });
        if (existingResponse) {
            return res.status(400).json({
                success: false,
                message: 'Quiz already completed. Cannot resubmit.'
            });
        }

        // Save responses
        const userResponse = await UserResponse.create({
            user_id: userId,
            group_id: req.user.group_id || null,
            responses: responses.map(r => ({
                question_id: r.questionId,
                selected_style: r.selectedStyle || null
            }))
        });

        // Calculate style profile
        const profileData = calculateStyleProfile(userResponse.responses);

        // Create user style profile
        const styleProfile = await UserStyleProfile.create({
            user_id: userId,
            group_id: req.user.group_id || null,
            ...profileData
        });

        // Update user quiz_complete status
        await User.findByIdAndUpdate(userId, { quiz_complete: true });

        // If in group mode, update group quiz status
        if (req.user.group_id) {
            await Group.findByIdAndUpdate(req.user.group_id, {
                [`quiz_status.${userId}`]: 'complete'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                profile: {
                    style_label: styleProfile.style_label,
                    primary_style: styleProfile.primary_style,
                    secondary_style: styleProfile.secondary_style,
                    dominant_color: styleProfile.dominant_color,
                    color_palette: styleProfile.color_palette
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/quiz/status
 * @desc    Check if user completed quiz
 * @access  Private
 */
export const getQuizStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                quiz_complete: user.quiz_complete
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/quiz/retake
 * @desc    Reset quiz so user can retake it
 * @access  Private
 */
export const retakeQuiz = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete existing responses and profile
        await UserResponse.deleteMany({ user_id: userId });
        await UserStyleProfile.deleteMany({ user_id: userId });

        // Reset quiz_complete flag
        await User.findByIdAndUpdate(userId, { quiz_complete: false });

        res.json({
            success: true,
            message: 'Quiz reset successfully. You can now retake the quiz.'
        });
    } catch (error) {
        next(error);
    }
};
