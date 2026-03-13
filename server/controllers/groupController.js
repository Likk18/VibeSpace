import Group from '../models/Group.js';
import User from '../models/User.js';
import { DEFAULT_WEIGHTS } from '../config/constants.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const generateInviteCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * @route   POST /api/groups/create
 * @desc    Create a new group
 * @access  Private
 */
export const createGroup = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] CreateGroup request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { mode_label, member_count, weights, is_primary } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (member_count < 2 || member_count > 6) {
            return res.status(400).json({
                success: false,
                message: 'Group must have 2-6 members'
            });
        }

        let finalWeights;
        if (weights && Object.keys(weights).length > 0) {
            finalWeights = weights;
        } else {
            finalWeights = { [userId]: mode_label === 'partner' ? 0.6 : 1.0 / member_count };
        }

        const inviteCode = generateInviteCode();
        const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const group = await Group.create({
            mode_label,
            created_by: userId,
            member_ids: [userId],
            member_count,
            member_names: { [userId]: user.name },
            weights: finalWeights,
            quiz_status: { [userId]: 'pending' },
            invite_code: inviteCode,
            invite_expires: inviteExpires
        });

        await User.findByIdAndUpdate(userId, {
            mode: 'group',
            group_id: group._id
        });

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: {
                group: {
                    ...group.toObject(),
                    invite_code: inviteCode
                }
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] CreateGroup failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   POST /api/groups/join-by-code
 * @desc    Join group using invite code (for guest or logged in users)
 * @access  Public (with optional auth)
 */
export const joinByCode = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] JoinByCode request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { invite_code } = req.body;
        const userId = req.user?.id;

        const group = await Group.findOne({ invite_code: invite_code.toUpperCase() });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        if (new Date() > group.invite_expires) {
            return res.status(400).json({
                success: false,
                message: 'Invite code has expired'
            });
        }

        if (group.member_ids.length >= group.member_count) {
            return res.status(400).json({
                success: false,
                message: 'Group is full'
            });
        }

        if (userId) {
            // User joining - add to member_ids
            const joiningUser = await User.findById(userId);
            group.member_ids.push(userId);
            group.quiz_status.set(userId, 'pending');
            group.member_names.set(userId, joiningUser.name);
            
            const currentWeightSum = Array.from(group.weights.values()).reduce((a, b) => a + b, 0);
            const remainingWeight = 1.0 - currentWeightSum;
            group.weights.set(userId, remainingWeight / (group.member_count - group.member_ids.length + 1));
            
            await group.save();
            
            await User.findByIdAndUpdate(userId, {
                mode: 'group',
                group_id: group._id
            });
        }

        res.json({
            success: true,
            message: userId ? 'Joined group successfully' : 'Code valid - please login or continue as guest',
            data: {
                group_id: group._id,
                member_count: group.member_count,
                current_members: group.member_ids.length,
                requires_auth: !userId,
                quiz_status: Object.fromEntries(group.quiz_status),
                member_names: Object.fromEntries(group.member_names || new Map())
            }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] JoinByCode failed | Error: ${error.message} | Stack: ${error.stack}`);
        next(error);
    }
};

/**
 * @route   PUT /api/groups/:id/weights
 * @desc    Update group weights
 * @access  Private
 */
export const updateWeights = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] UpdateWeights request received | Method: ${req.method} | URL: ${req.originalUrl}`);
    try {
        const { id } = req.params;
        const { weights } = req.body;
        const userId = req.user.id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const weightValues = Object.values(weights);
        const weightSum = weightValues.reduce((a, b) => a + b, 0);

        if (Math.abs(weightSum - 1.0) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Weights must sum to 1.0'
            });
        }

        group.weights = new Map(Object.entries(weights));
        await group.save();

        res.json({
            success: true,
            message: 'Weights updated successfully',
            data: { weights: Object.fromEntries(group.weights) }
        });
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] UpdateWeights failed | Error: ${error.message} | Stack: ${error.stack}`);
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
