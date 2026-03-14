import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    asin: {
        type: String,
        unique: true,
        sparse: true // Allow products without ASIN
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    old_price: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    sub_category: {
        type: String,
        default: ''
    },
    style_tags: [{
        type: String,
        enum: ['minimalist', 'bohemian', 'scandinavian', 'industrial', 'modern-luxury', 'traditional', 'maximalist'],
        required: true
    }],
    color_tag: {
        type: String,
        required: true
    },
    material_tag: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    rmbg_image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    review_count: {
        type: Number,
        min: 0,
        default: 0
    },
    reviews: [{
        id: String,
        review: String,
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        sentiment: String
    }],
    in_stock: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        default: 'kaggle_amazon'
    },
    designer: {
        type: String,
        default: 'Unknown Designer'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
productSchema.index({ style_tags: 1 });
productSchema.index({ color_tag: 1 });
productSchema.index({ material_tag: 1 });
productSchema.index({ category: 1, in_stock: 1 });
productSchema.index({ rating: -1 });

export default mongoose.model('Product', productSchema);
