import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CSV_FILE = path.join(__dirname, 'ikea.csv');

const updateProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        let count = 0;
        let batch = [];
        
        // Use a pipeline to update all matched products
        const updatePromises = [];

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                const imageUrl = row.primary_image || '';
                const rmbgImage = row.rmbg_image || '';
                const subCategory = row.sub_category || '';

                if (imageUrl) {
                    batch.push({
                        updateOne: {
                            filter: { image_url: imageUrl },
                            update: { $set: { sub_category: subCategory, rmbg_image: rmbgImage } }
                        }
                    });
                }

                if (batch.length >= 1000) {
                    const currentBatch = [...batch];
                    batch = [];
                    updatePromises.push(Product.bulkWrite(currentBatch));
                }
            })
            .on('end', async () => {
                if (batch.length > 0) {
                    updatePromises.push(Product.bulkWrite(batch));
                }
                
                console.log('Waiting for all database updates to finish...');
                const results = await Promise.all(updatePromises);
                const modifiedCount = results.reduce((sum, res) => sum + (res.modifiedCount || 0), 0);
                
                console.log(`Successfully updated ${modifiedCount} products with rmbg_image and sub_category.`);
                process.exit(0);
            })
            .on('error', (err) => {
                console.error('Error reading CSV:', err);
                process.exit(1);
            });
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1);
    }
};

updateProducts();
