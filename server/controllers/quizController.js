import QuizQuestion from '../models/QuizQuestion.js';
import UserResponse from '../models/UserResponse.js';
import UserStyleProfile from '../models/UserStyleProfile.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import { calculateStyleProfile } from '../utils/scoring.js';
import { mergeGroupProfiles } from '../utils/merging.js';
import logger from '../utils/logger.js';

/**
 * @route   GET /api/quiz/questions
 * @desc    Get all quiz questions
 * @access  Public (for guest quiz)
 */
export const getQuestions = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetQuestions request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetQuestions failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/quiz/guest-submit
 * @desc    Submit quiz as guest and return profile (no auth required)
 * @access  Public
 */
export const guestSubmit = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GuestSubmit request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { responses, group_id, guest_name } = req.body;

        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const userResponse = await UserResponse.create({
            user_id: guestId,
            group_id: group_id || null,
            is_guest: true,
            responses: responses.map(r => ({
                question_id: r.questionId,
                selected_style: r.selectedStyle || null
            }))
        });

        const profileData = calculateStyleProfile(userResponse.responses);

        const styleProfile = await UserStyleProfile.create({
            user_id: guestId,
            group_id: group_id || null,
            is_guest: true,
            ...profileData
        });

        let autoMerged = false;
        let groupProfile = null;

        // If guest is part of a group, update group status
        if (group_id) {
            const group = await Group.findById(group_id);
            
            if (group) {
                // Mark guest as completed in quiz_status
                group.quiz_status.set(guestId, 'completed');
                group.member_names.set(guestId, guest_name || 'Guest');
                
                // Store guest profile data
                group.guest_responses.set(guestId, {
                    profile: profileData,
                    user_id: guestId,
                    name: guest_name || 'Guest'
                });
                
                await group.save();

                // Check if all members (including guest) completed
                const allMembersComplete = Array.from(group.quiz_status.values())
                    .every(status => status === 'completed');

                if (allMembersComplete && !group.merge_complete) {
                    // Merge all member profiles + guest profile
                    const memberProfiles = await UserStyleProfile.find({
                        $or: [
                            { user_id: { $in: group.member_ids } },
                            { user_id: guestId }
                        ]
                    });

                    const weightsObj = Object.fromEntries(group.weights);
                    const mergedData = mergeGroupProfiles(memberProfiles, weightsObj);

                    groupProfile = await GroupStyleProfile.findOneAndUpdate(
                        { group_id: group._id },
                        {
                            group_id: group._id,
                            ...mergedData,
                            merged_from: memberProfiles.map(p => p._id),
                            weights_applied: weightsObj
                        },
                        { new: true, upsert: true }
                    );

                    group.merge_complete = true;
                    await group.save();
                    autoMerged = true;
                }
            }
        }

        res.status(201).json({
            success: true,
            message: autoMerged ? 'Guest quiz submitted and group profile created!' : 'Guest quiz submitted successfully',
            data: {
                guest_token: guestId,
                guest_name: guest_name || 'Guest',
                profile: {
                    style_label: styleProfile.style_label,
                    primary_style: styleProfile.primary_style,
                    secondary_style: styleProfile.secondary_style,
                    dominant_color: styleProfile.dominant_color,
                    dominant_material: styleProfile.dominant_material,
                    color_palette: styleProfile.color_palette
                },
                group_profile: groupProfile ? {
                    style_label: groupProfile.style_label,
                    primary_style: groupProfile.primary_style,
                    secondary_style: groupProfile.secondary_style,
                    dominant_color: groupProfile.dominant_color,
                    color_palette: groupProfile.color_palette
                } : null,
                auto_merged: autoMerged
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GuestSubmit failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/quiz/submit
 * @desc    Submit quiz responses and generate style profile
 * @access  Private
 */
export const submitQuiz = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] SubmitQuiz request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { responses } = req.body;
        const userId = req.user.id;

        // Check if user already submitted
        const existingResponse = await UserResponse.findOne({ user_id: userId });
        if (existingResponse) {
            // Delete old responses and profile so they can resubmit smoothly
            await UserResponse.deleteMany({ user_id: userId });
            await UserStyleProfile.deleteMany({ user_id: userId });
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

        let autoMerged = false;
        let groupProfile = null;

        // If in group mode, update group quiz status and check if all complete
        if (req.user.group_id) {
            const group = await Group.findById(req.user.group_id);
            
            if (group) {
                // Mark ONLY this user as completed in group quiz_status
                group.quiz_status.set(userId, 'completed');
                await group.save();

                // Check if ALL members in the group have completed
                // Use quiz_status map instead of User.quiz_complete to avoid the bug
                // where first person completing marks everyone as done
                const allMembersComplete = Array.from(group.quiz_status.values())
                    .every(status => status === 'completed');

                if (allMembersComplete && !group.merge_complete) {
                    // Auto-merge all profiles
                    const memberProfiles = await UserStyleProfile.find({
                        user_id: { $in: group.member_ids }
                    });

                    // Also include any guest profiles
                    const guestIds = [];
                    if (group.guest_responses) {
                        for (const [guestId] of group.guest_responses) {
                            guestIds.push(guestId);
                        }
                    }
                    if (guestIds.length > 0) {
                        const guestProfiles = await UserStyleProfile.find({
                            user_id: { $in: guestIds }
                        });
                        memberProfiles.push(...guestProfiles);
                    }

                    const weightsObj = Object.fromEntries(group.weights);
                    const mergedData = mergeGroupProfiles(memberProfiles, weightsObj);

                    groupProfile = await GroupStyleProfile.findOneAndUpdate(
                        { group_id: group._id },
                        {
                            group_id: group._id,
                            ...mergedData,
                            merged_from: memberProfiles.map(p => p._id),
                            weights_applied: weightsObj
                        },
                        { new: true, upsert: true }
                    );

                    group.merge_complete = true;
                    await group.save();
                    autoMerged = true;
                }
            }
        }

        res.status(201).json({
            success: true,
            message: autoMerged ? 'Quiz submitted and group profile created!' : 'Quiz submitted successfully',
            data: {
                profile: {
                    style_label: styleProfile.style_label,
                    primary_style: styleProfile.primary_style,
                    secondary_style: styleProfile.secondary_style,
                    dominant_color: styleProfile.dominant_color,
                    color_palette: styleProfile.color_palette
                },
                group_profile: groupProfile ? {
                    style_label: groupProfile.style_label,
                    primary_style: groupProfile.primary_style,
                    secondary_style: groupProfile.secondary_style,
                    dominant_color: groupProfile.dominant_color,
                    color_palette: groupProfile.color_palette
                } : null,
                auto_merged: autoMerged
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] SubmitQuiz failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/quiz/status
 * @desc    Check if user completed quiz
 * @access  Private
 */
export const getQuizStatus = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetQuizStatus request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                quiz_complete: user.quiz_complete
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetQuizStatus failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/quiz/retake
 * @desc    Reset quiz so user can retake it
 * @access  Private
 */
export const retakeQuiz = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] RetakeQuiz request received | Method: ${req.method} | URL: ${req.originalUrl}`);
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
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] RetakeQuiz failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
