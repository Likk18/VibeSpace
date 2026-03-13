import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    mode_label: {
        type: String,
        enum: ['partner', 'roommates', 'family', 'custom'],
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    member_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    member_count: {
        type: Number,
        required: true,
        min: 2,
        max: 6
    },
    member_names: {
        type: Map,
        of: String,
        default: {}
        // Format: { "userId1": "Alice", "userId2": "Bob", "guest_temp_id": "Guest" }
    },
    weights: {
        type: Map,
        of: Number,
        required: true
        // Format: { "userId1": 0.6, "userId2": 0.4 }
    },
    quiz_status: {
        type: Map,
        of: String,
        default: {}
        // Format: { "userId1": "completed", "userId2": "pending", "guest_id": "in_progress" }
        // Values: 'pending', 'in_progress', 'completed'
    },
    guest_responses: {
        type: Map,
        of: Object,
        default: {}
        // Format: { "guest_temp_id": { responses: [], profile: {...} } }
    },
    merge_complete: {
        type: Boolean,
        default: false
    },
    invite_code: {
        type: String,
        unique: true,
        sparse: true
    },
    invite_expires: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Validate that weights sum to 1.0 (Only if merge_complete is true)
groupSchema.pre('save', function (next) {
    if (this.merge_complete) {
        const weightValues = Array.from(this.weights.values());
        const sum = weightValues.reduce((acc, val) => acc + val, 0);

        if (Math.abs(sum - 1.0) > 0.01) {
            next(new Error('Weights must sum to 1.0 when group is complete'));
        }
    }
    next();
});

export default mongoose.model('Group', groupSchema);
