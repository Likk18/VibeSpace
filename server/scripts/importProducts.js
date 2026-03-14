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

/**
 * Parse the reviews column from CSV.
 * CSV format: [{'id': 'r_0_1', 'review': 'text', 'rating': 2.0, 'sentiment': 'negative'}, ...]
 * We need to convert Python-style dicts to JSON (single quotes → double quotes).
 */
const parseReviews = (reviewsStr) => {
    if (!reviewsStr || reviewsStr.trim() === '' || reviewsStr === '[]') {
        return [];
    }
    
    try {
        // Convert Python-style single-quoted dicts to valid JSON
        const jsonStr = reviewsStr
            .replace(/'/g, '"')           // Single quotes → double quotes
            .replace(/None/g, 'null')     // Python None → null
            .replace(/True/g, 'true')     // Python True → true
            .replace(/False/g, 'false');  // Python False → false
        
        const parsed = JSON.parse(jsonStr);
        
        if (!Array.isArray(parsed)) return [];
        
        return parsed.map(r => ({
            id: r.id || '',
            review: r.review || '',
            rating: typeof r.rating === 'number' ? r.rating : parseFloat(r.rating) || 0,
            sentiment: r.sentiment || 'neutral'
        }));
    } catch (err) {
        // If parsing fails, return empty array silently
        return [];
    }
};

const importProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        const products = [];
        let count = 0;
        let reviewsCount = 0;

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                // Map predicted style to the enum in Schema
                let style = row.predicted_style ? row.predicted_style.toLowerCase().trim() : 'minimalist';
                if (style === 'modern_luxury') style = 'modern-luxury';
                
                // Image URL — CSV already contains full jsDelivr CDN URLs
                const imageUrl = row.primary_image || '';

                // Price checking
                const price = parseFloat(row.price);
                
                if (!isNaN(price) && row.product_name) {
                    // Parse reviews from CSV
                    const reviews = parseReviews(row.reviews);
                    
                    // Calculate average rating from reviews
                    let avgRating = 0;
                    if (reviews.length > 0) {
                        const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                        avgRating = totalRating / reviews.length;
                        reviewsCount++;
                    }

                    const oldPrice = parseFloat(row.old_price);
                    const tags = [];
                    if (row.offer && row.offer !== 'FALSE') tags.push('offers');
                    if (oldPrice > price) tags.push('offers');
                    if (row.new_arrival === 'TRUE') tags.push('new_arrival');

                    const productData = {
                        name: row.product_name,
                        price: price,
                        original_price: !isNaN(oldPrice) ? oldPrice : price,
                        category: row.category || 'Other',
                        style_tags: [style],
                        tags: [...new Set(tags)],
                        color_tag: 'multi',
                        material_tag: 'mixed',
                        image_url: imageUrl,
                        rmbg_image: row.rmbg_image || '',
                        description: row.short_description || row.caption || '',
                        source: 'ikea_csv',
                        designer: row.designer || 'IKEA of Sweden',
                        rating: avgRating,
                        review_count: reviews.length,
                        reviews: reviews
                    };
                    products.push(productData);
                    count++;
                }

                // Insert in batches of 500 to prevent memory blowup
                if (products.length >= 500) {
                    const batch = products.splice(0, products.length);
                    Product.insertMany(batch, { ordered: false }).catch(err => {
                        console.error(`Batch insert error: ${err.message}`);
                    });
                }
            })
            .on('end', async () => {
                if (products.length > 0) {
                    await Product.insertMany(products, { ordered: false }).catch(err => {
                        console.error(`Final batch insert error: ${err.message}`);
                    });
                }
                console.log(`Successfully imported ${count} products.`);
                console.log(`${reviewsCount} products had reviews parsed from CSV.`);
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
