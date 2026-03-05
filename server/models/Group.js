import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    mode_label: {
        type: String,
        enum: ['partner', 'roommates', 'family', 'custom'],
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
        max: 4
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
        // Format: { "userId1": "complete", "userId2": "pending" }
    },
    merge_complete: {
        type: Boolean,
        default: false
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
