import mongoose from 'mongoose';

const userStyleProfileSchema = new mongoose.Schema({
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
    is_group_profile: {
        type: Boolean,
        default: false
    },
    raw_scores: {
        minimalist: { type: Number, default: 0 },
        bohemian: { type: Number, default: 0 },
        scandinavian: { type: Number, default: 0 },
        industrial: { type: Number, default: 0 },
        'modern-luxury': { type: Number, default: 0 },
        traditional: { type: Number, default: 0 },
        maximalist: { type: Number, default: 0 }
    },
    color_scores: {
        type: Map,
        of: Number,
        default: {}
    },
    material_scores: {
        type: Map,
        of: Number,
        default: {}
    },
    primary_style: {
        type: String,
        required: true
    },
    secondary_style: {
        type: String,
        default: null
    },
    style_label: {
        type: String,
        required: true
    },
    dominant_color: {
        type: String,
        required: true
    },
    dominant_material: {
        type: String,
        default: 'wood'
    },
    color_palette: [{
        type: String // Hex color codes
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// One profile per user
userStyleProfileSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.model('UserStyleProfile', userStyleProfileSchema);
