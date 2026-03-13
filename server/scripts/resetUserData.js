import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Group from '../models/Group.js';
import UserResponse from '../models/UserResponse.js';
import UserStyleProfile from '../models/UserStyleProfile.js';
import GroupStyleProfile from '../models/GroupStyleProfile.js';
import Order from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resetUserData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');

        await User.deleteMany({});
        console.log('Cleared Users');

        await Group.deleteMany({});
        console.log('Cleared Groups');

        await UserResponse.deleteMany({});
        console.log('Cleared UserResponses');
        
        await UserStyleProfile.deleteMany({});
        console.log('Cleared UserStyleProfiles');

        await GroupStyleProfile.deleteMany({});
        console.log('Cleared GroupStyleProfiles');
        
        if (Order) {
            await Order.deleteMany({});
            console.log('Cleared Orders');
        }

        console.log('All user data cleared manually.');
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed or error clearing', err);
        process.exit(1);
    }
};

resetUserData();
