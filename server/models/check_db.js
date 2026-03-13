import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const p = await Product.findOne({ name: 'LENÅS' });
    console.log("Sub_category:", p?.sub_category);
    console.log("Category:", p?.category);
    process.exit(0);
};

check();
