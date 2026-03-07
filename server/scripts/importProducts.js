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

const CSV_FILE = path.join(__dirname, 'ikea_products_classified.csv');

const importProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');

        await Product.deleteMany({}); // Clear existing products (or maybe just the kaggle ones?)
        console.log('Cleared existing products');

        const products = [];
        let count = 0;

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                // Map predicted style to the enum in Schema
                let style = row.predicted_style ? row.predicted_style.toLowerCase().trim() : 'minimalist';
                if (style === 'modern_luxury') style = 'modern-luxury';
                // Fix image URL to point to our local assets path and handle the duplicated category folder on disk
                const rawImageUrl = row.primary_image || '';
                let imageUrl = rawImageUrl;
                
                // Matches e.g. "IKEA-Dataset-master/IKEA-Dataset-master/Hallway/Wordrobes/..."
                const match = rawImageUrl.match(/IKEA-Dataset-master\/IKEA-Dataset-master\/(.*?)\/(.*)/);
                
                if (rawImageUrl.startsWith('./IKEA-Dataset/')) {
                    const match2 = rawImageUrl.match(/^\.\/IKEA-Dataset\/(.*?)\/(.*)/);
                    if (match2) {
                        const categoryName = match2[1];
                        const restOfPath = match2[2];
                        imageUrl = `/assets/IKEA-Dataset/${categoryName}/${categoryName}/${restOfPath}`;
                    } else {
                        imageUrl = rawImageUrl.replace('./IKEA-Dataset/', '/assets/IKEA-Dataset/');
                    }
                } else if (match) {
                    const categoryName = match[1];
                    const restOfPath = match[2];
                    imageUrl = `/assets/content/IKEA-Dataset-master/IKEA-Dataset-master/${categoryName}/${categoryName}/${restOfPath}`;
                } else if (rawImageUrl.includes('content/')) {
                    imageUrl = rawImageUrl.replace(/^.*?content\//, '/assets/content/');
                }

                // Price checking
                const price = parseFloat(row.price);
                
                if (!isNaN(price) && row.product_name) {
                    const productData = {
                        name: row.product_name,
                        price: price,
                        category: row.category || 'Other',
                        style_tags: [style],
                        color_tag: 'multi', // Defaulting since not in CSV
                        material_tag: 'mixed', // Defaulting since not in CSV
                        image_url: imageUrl,
                        description: row.short_description || row.caption || '',
                        source: 'ikea_csv',
                        designer: row.designer || 'IKEA of Sweden'
                    };
                    products.push(productData);
                    count++;
                }

                // Insert in batches of 1000 to prevent memory blowup
                if (products.length >= 1000) {
                    const batch = products.splice(0, products.length);
                    Product.insertMany(batch).catch(console.error);
                }
            })
            .on('end', async () => {
                if (products.length > 0) {
                    await Product.insertMany(products).catch(console.error);
                }
                console.log(`Successfully imported ${count} products.`);
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

importProducts();
