import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        image_url: String,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    total_amount: {
        type: Number,
        required: true
    },
    shipping_address: {
        name: String,
        street: String,
        area: String,
        city: String,
        state: String,
        pincode: String,
        tag: String
    },
    payment_method: {
        type: String,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    delivery_status: {
        type: String,
        enum: ['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'processing'
    },
    order_id: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

// Index for user lookup
orderSchema.index({ user: 1 });
orderSchema.index({ order_id: 1 });

export default mongoose.model('Order', orderSchema);
