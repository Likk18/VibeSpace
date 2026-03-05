import mongoose from 'mongoose';

const groupStyleProfileSchema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        unique: true
    },
    is_group_profile: {
        type: Boolean,
        default: true
    },
    merged_from: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserStyleProfile'
    }],
    weights_applied: {
        type: Map,
        of: Number,
        required: true
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
        required: true
    },
    color_palette: [{
        type: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('GroupStyleProfile', groupStyleProfileSchema);
