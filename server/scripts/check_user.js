import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import UserResponse from '../models/UserResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkUser() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ name: 'Likith B' }) || await User.findOne();
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    console.log('User:', user.name, '| Quiz complete:', user.quiz_complete);

    const prevResponse = await UserResponse.findOne({ user_id: user._id });
    if (prevResponse) {
        console.log('User ALREADY has a quiz response stored! ID:', prevResponse._id);
    } else {
        console.log('No existing user response found.');
    }

    process.exit(0);
}

checkUser().catch(console.error);
