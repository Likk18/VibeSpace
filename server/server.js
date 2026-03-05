import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import groupRoutes from './routes/groups.js';
import profileRoutes from './routes/profile.js';
import moodboardRoutes from './routes/moodboard.js';
import productRoutes from './routes/products.js';

// Load environment variables
dotenv.config();

import Product from './models/Product.js';
import QuizQuestion from './models/QuizQuestion.js';
import seedDatabase from './scripts/seedDataset.js';

// Connect to MongoDB
await connectDB();

try {
    const productCount = await Product.countDocuments();
    const quizCount = await QuizQuestion.countDocuments();
    if (productCount === 0 || quizCount === 0) {
        console.log('Database empty or incomplete, automatically running seed script...');
        await seedDatabase();
    }
} catch (error) {
    console.error('Failed to run initial seed verification:', error);
}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (Must be before rate limiter)
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        /\.vercel\.app$/ // Allow all Vercel subdomains
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased limit for testing
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/moodboard', moodboardRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'VibeSpace API is running',
        timestamp: new Date().toISOString()
    });
});

// Seed endpoint for testing
app.get('/api/seed', async (req, res) => {
    try {
        await seedDatabase();
        const pCount = await Product.countDocuments();
        const qCount = await QuizQuestion.countDocuments();
        res.json({ success: true, message: 'Seeding completed', products: pCount, questions: qCount });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to VibeSpace API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           🏠 VibeSpace API Server Running            ║
║                                                       ║
║   Port: ${PORT}                                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   MongoDB: Connected                                  ║
║                                                       ║
║   Make Space Feel Like You.                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;

