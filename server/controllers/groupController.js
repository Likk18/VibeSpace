import Group from '../models/Group.js';
import User from '../models/User.js';
import { DEFAULT_WEIGHTS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * @route   POST /api/groups/create
 * @desc    Create a new group
 * @access  Private
 */
export const createGroup = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] CreateGroup request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { mode_label, member_count, weights } = req.body;
        const userId = req.user.id;

        // Validate member count
        if (member_count < 2 || member_count > 4) {
            return res.status(400).json({
                success: false,
                message: 'Group must have 2-4 members'
            });
        }

        // Handle weights calculation
        let finalWeights = weights;
        // If frontend passes empty object or null, set default even weight
        if (!finalWeights || Object.keys(finalWeights).length === 0) {
            finalWeights = { [userId]: 1.0 / member_count };
        }

        // Create group
        const group = await Group.create({
            mode_label,
            member_ids: [userId],
            member_count,
            weights: finalWeights,
            quiz_status: { [userId]: 'pending' }
        });

        // Update user with group_id
        await User.findByIdAndUpdate(userId, {
            mode: 'group',
            group_id: group._id
        });

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: { group }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] CreateGroup failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join an existing group
 * @access  Private
 */
export const joinGroup = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] JoinGroup request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if group is full
        if (group.member_ids.length >= group.member_count) {
            return res.status(400).json({
                success: false,
                message: 'Group is full'
            });
        }

        // Add user to group
        group.member_ids.push(userId);
        group.quiz_status.set(userId, 'pending');

        // Set default weight for new member
        const remainingWeight = 1.0 - Array.from(group.weights.values()).reduce((a, b) => a + b, 0);
        group.weights.set(userId, remainingWeight / (group.member_count - group.member_ids.length + 1));

        await group.save();

        // Update user
        await User.findByIdAndUpdate(userId, {
            mode: 'group',
            group_id: group._id
        });

        res.json({
            success: true,
            message: 'Joined group successfully',
            data: { group }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] JoinGroup failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   GET /api/groups/:id/status
 * @desc    Get group quiz completion status
 * @access  Private
 */
export const getGroupStatus = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] GetGroupStatus request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { id } = req.params;

        const group = await Group.findById(id)
            .populate('member_ids', 'name email quiz_complete');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const allComplete = group.member_ids.every(member => member.quiz_complete);

        res.json({
            success: true,
            data: {
                group,
                all_complete: allComplete,
                members: group.member_ids.map(member => ({
                    id: member._id,
                    name: member.name,
                    quiz_complete: member.quiz_complete
                }))
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] GetGroupStatus failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};
