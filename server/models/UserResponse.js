import mongoose from 'mongoose';

const userResponseSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    is_guest: {
        type: Boolean,
        default: false
    },
    responses: [{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizQuestion',
            required: true
        },
        selected_style: {
            type: String,
            default: null // null if skipped
        },
        selected_color: {
            type: String,
            default: null
        },
        selected_material: {
            type: String,
            default: null
        }
    }],
    submitted_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure one response set per user
userResponseSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.model('UserResponse', userResponseSchema);
