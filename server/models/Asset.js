import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['room', 'texture'],
        required: true
    },
    style: {
        type: String,
        enum: ['minimalist', 'bohemian', 'scandinavian', 'industrial', 'modern-luxury', 'traditional', 'maximalist'],
        required: true
    },
    color_tag: {
        type: String,
        required: true
    },
    material_tag: {
        type: String,
        default: null
    },
    image_url: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'unsplash'
    },
    attribution: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for mood board generation queries
assetSchema.index({ type: 1, style: 1 });
assetSchema.index({ type: 1, material_tag: 1 });

export default mongoose.model('Asset', assetSchema);
