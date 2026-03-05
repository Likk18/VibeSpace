import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    question_number: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 25
    },
    question_text: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['full_room', 'furniture', 'lighting', 'texture', 'color', 'bedroom'],
        required: true
    },
    image_options: [{
        image_url: {
            type: String,
            required: true
        },
        style_tag: {
            type: String,
            required: true
        },
        color_tag: {
            type: String,
            required: true
        },
        material_tag: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Validate exactly 4 image options per question
quizQuestionSchema.pre('save', function (next) {
    if (this.image_options.length !== 4) {
        next(new Error('Each question must have exactly 4 image options'));
    }
    next();
});

// Index for faster question retrieval
quizQuestionSchema.index({ question_number: 1 });

export default mongoose.model('QuizQuestion', quizQuestionSchema);
