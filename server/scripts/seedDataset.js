import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Product from '../models/Product.js';
import QuizQuestion from '../models/QuizQuestion.js';

const CSV_FILE_PATH = path.join(process.cwd(), '..', 'scripts', 'amazon_furniture_tagged.csv');

const QUIZ_CATEGORIES = ['full_room', 'furniture', 'lighting', 'texture', 'color', 'bedroom'];

const seedDatabase = async () => {
    try {
        console.log('Clearing existing products and quiz questions...');
        await Product.deleteMany();
        await QuizQuestion.deleteMany();
        console.log('Clearing complete.');

        console.log(`Parsing CSV from ${CSV_FILE_PATH}...`);

        const products = [];
        const uniqueStyles = new Set();
        const uniqueColors = new Set();
        const uniqueMaterials = new Set();
        const seenAsins = new Set();

        return new Promise((resolve, reject) => {
            fs.createReadStream(CSV_FILE_PATH)
                .pipe(csv())
                .on('data', (row) => {
                    try {
                        // Extract style tags array correctly from string representation like "['industrial', 'minimalist']" or "['industrial']"
                        let parsedStyleTags = [];
                        if (row.style_tags) {
                            try {
                                // simple regex to extract words inside single quotes
                                const matches = row.style_tags.match(/'([^']+)'/g);
                                if (matches) {
                                    parsedStyleTags = matches.map(m => {
                                        let tag = m.replace(/'/g, '');
                                        if (tag === 'modern_luxury') return 'modern-luxury';
                                        return tag;
                                    });
                                }
                            } catch (e) {
                                console.warn('Could not parse style tags:', row.style_tags);
                            }
                        }

                        // fallback if parsing fails or no style tags
                        if (parsedStyleTags.length === 0) {
                            parsedStyleTags = ['modern-luxury']; // default fallback
                        }

                        // Collect unique properties to build diverse quiz questions later
                        parsedStyleTags.forEach(t => uniqueStyles.add(t));
                        if (row.color_tag) uniqueColors.add(row.color_tag);
                        if (row.material_tag) uniqueMaterials.add(row.material_tag);

                        // Parse price
                        let rawPrice = row.price;
                        let numPrice = 0;
                        if (rawPrice && rawPrice.startsWith('$')) {
                            numPrice = parseFloat(rawPrice.replace('$', '').replace(',', ''));
                        }

                        if (row.asin && seenAsins.has(row.asin)) {
                            return; // Skip duplicate ASINs
                        }
                        if (row.asin) {
                            seenAsins.add(row.asin);
                        }

                        const product = new Product({
                            asin: row.asin || null,
                            name: row.title || 'Unknown Product',
                            price: isNaN(numPrice) ? 0 : numPrice,
                            category: row.categories || 'Uncategorized',
                            style_tags: parsedStyleTags,
                            color_tag: row.color_tag || 'neutral',
                            material_tag: row.material_tag || 'wood',
                            image_url: row.primary_image || 'https://via.placeholder.com/300',
                            description: row.description || '',
                            rating: parseFloat(row.rating) || 0,
                            in_stock: true,
                            source: 'amazon_dataset'
                        });

                        products.push(product);
                    } catch (err) {
                        console.error('Error parsing row:', row.asin, err.message);
                    }
                })
                .on('end', async () => {
                    console.log(`Successfully parsed ${products.length} products.`);

                    try {
                        // 1. Insert Products
                        console.log('Inserting products to MongoDB...');
                        await Product.insertMany(products);
                        console.log('Products inserted.');

                        // 2. Generate and Insert Quiz Questions
                        console.log('Generating BuzzFeed-style quiz questions...');
                        const questionsToInsert = [];

                        for (let i = 0; i < QUIZ_CATEGORIES.length; i++) {
                            const category = QUIZ_CATEGORIES[i];

                            // Randomly select 4 distinct products to use as image options for this question
                            // to make it "BuzzFeed-style", users pick the image they vibe with most
                            const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
                            const selectedProducts = shuffledProducts.slice(0, 4);

                            const imageOptions = selectedProducts.map(prod => ({
                                image_url: prod.image_url,
                                style_tag: prod.style_tags[0] || 'minimalist',
                                color_tag: prod.color_tag,
                                material_tag: prod.material_tag
                            }));

                            // Create the question text based on category
                            let questionText = "Which of these speaks to you most?";
                            if (category === 'full_room') questionText = "Pick a room setting that matches your perfect vibe:";
                            if (category === 'furniture') questionText = "Choose a piece of furniture you'd love to own:";
                            if (category === 'lighting') questionText = "Which lighting style catches your eye?";
                            if (category === 'texture') questionText = "Select the texture or pattern you're most drawn to:";
                            if (category === 'color') questionText = "Which color palette makes you feel at home?";
                            if (category === 'bedroom') questionText = "Finally, pick a bedroom setup for your ideal morning:";

                            questionsToInsert.push({
                                question_number: i + 1,
                                question_text: questionText,
                                category: category,
                                image_options: imageOptions
                            });
                        }

                        console.log('Inserting quiz questions to MongoDB...');
                        await QuizQuestion.insertMany(questionsToInsert);
                        console.log('Quiz questions inserted safely.');

                        console.log('Seeding complete!');
                        resolve();

                    } catch (err) {
                        console.error('Error during database insertion:');
                        if (err.name === 'ValidationError') {
                            for (let field in err.errors) {
                                console.error(`- ${field}: ${err.errors[field].message}`);
                            }
                        } else if (err.writeErrors) {
                            err.writeErrors.forEach(we => {
                                console.error(we.err.errmsg);
                            });
                        } else {
                            console.error(err.message);
                        }
                        reject(err);
                    }
                })
                .on('error', (error) => {
                    console.error('Error reading CSV stream:', error);
                    reject(error);
                });
        });

    } catch (error) {
        console.error('Seeding script failed:', error);
        throw error;
    }
};

export default seedDatabase;
