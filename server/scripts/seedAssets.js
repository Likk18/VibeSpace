import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Asset from '../models/Asset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ASSETS_DIR = path.join(__dirname, '..', '..', 'client', 'assets');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets';

const VIBES = [
    { folder: 'Bohemian',     tag: 'bohemian',      color: '#8B6914', material: 'cotton'  },
    { folder: 'Industrial',   tag: 'industrial',    color: '#4A4A4A', material: 'metal'   },
    { folder: 'Maximalist',   tag: 'maximalist',    color: '#C4396C', material: 'velvet'  },
    { folder: 'Minimalist',   tag: 'minimalist',    color: '#F5F5F0', material: 'linen'   },
    { folder: 'ModernLuxury', tag: 'modern-luxury', color: '#C9A84C', material: 'marble'  },
    { folder: 'Scandinavian', tag: 'scandinavian',  color: '#B0BEC5', material: 'wood'    },
    { folder: 'Traditional',  tag: 'traditional',   color: '#7D3C26', material: 'leather' }
];

function getImages(vibeFolder, categoryFolder) {
    const dirPath = path.join(ASSETS_DIR, vibeFolder, categoryFolder);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .map(f => `${CDN_BASE}/${vibeFolder}/${encodeURIComponent(categoryFolder)}/${encodeURIComponent(f)}`);
}

async function seedAssets() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing assets...');
    await Asset.deleteMany({});
    console.log('Cleared.');

    const assets = [];

    for (const vibe of VIBES) {
        // Room inspiration images — from "Overall Room 6" folder
        const roomFolder = fs.readdirSync(path.join(ASSETS_DIR, vibe.folder))
            .find(d => d.toLowerCase().startsWith('overall room'));
        if (roomFolder) {
            const roomImages = getImages(vibe.folder, roomFolder);
            for (const url of roomImages) {
                assets.push({
                    type: 'room',
                    style: vibe.tag,
                    color_tag: vibe.color,
                    material_tag: vibe.material,
                    image_url: url,
                    source: 'local'
                });
            }
        }

        // Texture images — from "Texture xx" folder
        const textureFolder = fs.readdirSync(path.join(ASSETS_DIR, vibe.folder))
            .find(d => d.toLowerCase().startsWith('texture'));
        if (textureFolder) {
            const textureImages = getImages(vibe.folder, textureFolder);
            for (const url of textureImages) {
                assets.push({
                    type: 'texture',
                    style: vibe.tag,
                    color_tag: vibe.color,
                    material_tag: vibe.material,
                    image_url: url,
                    source: 'local'
                });
            }
        }
    }

    console.log(`Inserting ${assets.length} assets...`);
    await Asset.insertMany(assets);
    console.log('Done! Assets seeded successfully.');

    const sample = await Asset.findOne({ type: 'room' });
    console.log('Sample room URL:', sample?.image_url);
    const sampleT = await Asset.findOne({ type: 'texture' });
    console.log('Sample texture URL:', sampleT?.image_url);

    process.exit(0);
}

seedAssets().catch(e => { console.error(e); process.exit(1); });
