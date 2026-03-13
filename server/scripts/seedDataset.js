import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QuizQuestion from '../models/QuizQuestion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The 7 vibe folders in client/assets
 */
const VIBES = [
    { folder: 'Bohemian', tag: 'bohemian' },
    { folder: 'Industrial', tag: 'industrial' },
    { folder: 'Maximalist', tag: 'maximalist' },
    { folder: 'Minimalist', tag: 'minimalist' },
    { folder: 'ModernLuxury', tag: 'modern-luxury' },
    { folder: 'Scandinavian', tag: 'scandinavian' },
    { folder: 'Traditional', tag: 'traditional' }
];

/**
 * Category config: folder name in assets
 */
const CATEGORIES = {
    bedroom: 'Bedroom 20',
    object: 'Object 20',
    texture: 'Texture 15',
    color: 'Color 8',
    overall_room: 'Overall Room 6',
    diy: 'DIY 8',
    lamp_fixture: 'Lamp Fixtures 6',
    rug: 'Rug 6'
};

const ASSETS_DIR = path.join(__dirname, '..', '..', 'client', 'assets');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets';

/**
 * Scan actual image files in a folder and return jsDelivr CDN URLs
 */
function getImageFiles(vibeFolder, categoryFolder) {
    const dirPath = path.join(ASSETS_DIR, vibeFolder, categoryFolder);
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .map(f => `${CDN_BASE}/${vibeFolder}/${encodeURIComponent(categoryFolder)}/${encodeURIComponent(f)}`);
}

/**
 * BuzzFeed-style question texts per category
 */
const QUESTION_POOL = {
    bedroom: [
        "Which bedroom makes you wanna hit snooze forever? 🛏️",
        "Pick the bedroom that screams 'main character energy' ✨",
        "Which bedroom would you show off on a home tour? 🏠",
        "Choose the bedroom that makes your heart skip a beat 💖"
    ],
    object: [
        "Pick the decor piece you'd totally steal from a fancy hotel 🏨",
        "Which object would look perfect on your shelf? ✨",
        "Choose the decor item that speaks to your soul 🎨",
        "Which small detail would tie your room together? 🏺"
    ],
    texture: [
        "Which texture would you want on your dream couch? 🛋️",
        "Pick the fabric that makes you go 'ooh, touchy' 🤲",
        "Which texture pattern catches your eye first? 👁️",
        "What material makes you feel most at home? 🪵"
    ],
    color: [
        "Which color palette screams *you*? 🎨",
        "Pick the tones that match your morning mood 🌅",
        "Which shades do you naturally gravitate towards? 🌈"
    ],
    overall_room: [
        "Choose a room that just *gets* you 🏡",
        "Which space would you spend a lazy Sunday in? ☕",
        "Pick the room you'd brag about to your friends 📸"
    ],
    diy: [
        "Which DIY project are you saving on Pinterest? 📌",
        "Pick the craft project that's calling your name 🔨",
        "Which DIY would you actually attempt this weekend? 🎨",
    ],
    lamp_fixture: [
        "Pick the light that sets *the* mood 💡",
        "Which lamp would you put in your cozy corner? 🕯️"
    ],
    rug: [
        "Which rug would you put under your coffee table? 🏠",
        "Pick the pattern you wouldn't mind walking on every day 👣"
    ]
};

/**
 * Shuffle an array in-place (Fisher-Yates)
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Pick a random element from an array
 */
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build 6 image options for a question by scanning actual files
 * Picks one random image per vibe from the given category folder
 * Only uses vibes that actually have images in this category
 */
function buildImageOptions(categoryFolder) {
    // Find which vibes actually have images for this category
    const available = [];
    for (const vibe of VIBES) {
        const images = getImageFiles(vibe.folder, categoryFolder);
        if (images.length > 0) {
            available.push({ vibe, images });
        }
    }

    if (available.length < 6) {
        console.warn(`  ⚠️ Only ${available.length} vibes have images for ${categoryFolder}, using all available`);
    }

    // Shuffle and pick up to 6 vibes
    shuffle(available);
    const selected = available.slice(0, 6);

    return selected.map(({ vibe, images }) => ({
        image_url: pickRandom(images),
        style_tag: vibe.tag
    }));
}

/**
 * Check which categories have enough vibes with images
 */
function getAvailableCategories() {
    const available = {};
    for (const [category, folder] of Object.entries(CATEGORIES)) {
        let vibeCount = 0;
        for (const vibe of VIBES) {
            const images = getImageFiles(vibe.folder, folder);
            if (images.length > 0) vibeCount++;
        }
        if (vibeCount >= 4) { // Need at least 4 vibes to make a meaningful question
            available[category] = folder;
        } else {
            console.warn(`⚠️ Skipping category "${category}" (${folder}): only ${vibeCount} vibes have images`);
        }
    }
    return available;
}

/**
 * Generate quiz questions from available assets
 */
function generateQuestions() {
    const availableCategories = getAvailableCategories();
    const questions = [];

    for (const [category, texts] of Object.entries(QUESTION_POOL)) {
        if (!availableCategories[category]) {
            console.warn(`⚠️ Skipping ${texts.length} "${category}" questions (no assets)`);
            continue;
        }

        const folder = availableCategories[category];

        for (const text of texts) {
            const options = buildImageOptions(folder);
            if (options.length >= 4) {
                questions.push({
                    question_text: text,
                    category,
                    image_options: options
                });
            }
        }
    }

    // Shuffle all questions randomly
    shuffle(questions);

    // Assign question numbers after shuffling
    questions.forEach((q, i) => {
        q.question_number = i + 1;
    });

    return questions;
}

/**
 * Seed the database with quiz questions using local asset images
 */
const seedDatabase = async () => {
    try {
        console.log('Clearing existing quiz questions...');
        await QuizQuestion.deleteMany();
        console.log('Clearing complete.');

        console.log('Scanning asset folders...');
        console.log(`Assets directory: ${ASSETS_DIR}`);
        const questions = generateQuestions();

        console.log(`Generated ${questions.length} quiz questions from local assets.`);
        if (questions.length === 0) {
            console.error('No questions generated! Check that asset folders exist.');
            return;
        }

        console.log('Inserting quiz questions...');
        // Use insertMany without running individual save validators
        await QuizQuestion.collection.insertMany(questions.map(q => ({
            ...q,
            createdAt: new Date(),
            updatedAt: new Date()
        })));
        console.log('Quiz questions inserted successfully!');
        console.log('Seeding complete! 🎉');
    } catch (error) {
        console.error('Seeding script failed:', error);
        throw error;
    }
};

export default seedDatabase;
