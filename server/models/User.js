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
