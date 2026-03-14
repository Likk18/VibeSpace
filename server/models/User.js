import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password_hash: {
        type: String,
        required: [true, 'Password is required'],
        select: false // Don't include password in queries by default
    },
    mode: {
        type: String,
        enum: ['single', 'group'],
        required: true,
        default: 'single'
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    quiz_complete: {
        type: Boolean,
        default: false
    },
    personalization_on: {
        type: Boolean,
        default: true
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    wishlist: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        folder: {
            type: String,
            default: 'General',
            trim: true
        },
        added_at: {
            type: Date,
            default: Date.now
        }
    }],
    recently_viewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    addresses: [{
        name: String,
        street: String,
        area: String,
        city: String,
        state: String,
        pincode: String,
        tag: {
            type: String,
            enum: ['Home', 'Work', 'Studio', 'Other'],
            default: 'Home'
        },
        is_default: {
            type: Boolean,
            default: false
        }
    }],
    phone: {
        type: String,
        trim: true
    },
    saved_cards: [{
        last4: { type: String, required: true },
        brand: { type: String, default: 'Visa' },
        holder_name: { type: String, default: '' },
        added_at: { type: Date, default: Date.now }
    }],
    saved_upis: [{
        upi_id: { type: String, required: true },
        bank_name: { type: String, default: 'Unknown Bank' },
        added_at: { type: Date, default: Date.now }
    }],
    vibepay_balance: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster email lookups
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
