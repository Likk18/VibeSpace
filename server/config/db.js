import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Cache the connection across Vercel serverless invocations
// readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
let isConnected = false;

const MONGOOSE_OPTIONS = {
    maxPoolSize: 10,          // Max connections in pool — safe for Atlas M0 free tier
    minPoolSize: 2,           // Keep minimum connections alive
    serverSelectionTimeoutMS: 5000,  // Fail fast if Atlas is unreachable
    socketTimeoutMS: 45000,   // Abort socket after 45s of inactivity
    connectTimeoutMS: 10000,  // 10s to establish connection
    heartbeatFrequencyMS: 30000, // Check server health every 30s
    retryWrites: true,
    retryReads: true,
};

const attachConnectionEvents = () => {
    mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Will reconnect on next request.');
        isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        isConnected = true;
    });
};

const connectDB = async () => {
    // Already connected — reuse existing connection (critical for Vercel/Lambda)
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, MONGOOSE_OPTIONS);
        isConnected = true;
        attachConnectionEvents();
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        isConnected = false;
        console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);

        // DO NOT fall back to in-memory DB in production/Vercel, as it will timeout and crash
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            console.error('⚠️ Cannot use in-memory database in production. Ensure MONGO_URI is correct and IP is whitelisted.');
            return; // Exit the function, let the API run but routes will fail gracefully if they check DB state
        }

        console.warn(`Falling back to in-memory database...`);
        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri, {
                ...MONGOOSE_OPTIONS,
                maxPoolSize: 5, // In-memory server doesn't need a large pool
            });
            isConnected = true;
            attachConnectionEvents();
            console.log(`✅ MongoDB In-Memory Connected: ${mongoose.connection.host}`);
        } catch (err) {
            console.error(`❌ MongoDB Memory Server Error: ${err.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;
