import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BG_DIR = path.join(__dirname, '../../client/assets/Backgrounds/Backgrounds');
const OUTPUT_FILE = path.join(__dirname, '../../client/src/utils/backgroundManifest.json');

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets/Backgrounds/Backgrounds';

const generateManifest = () => {
    const manifest = {};

    const categories = fs.readdirSync(BG_DIR).filter(f => fs.statSync(path.join(BG_DIR, f)).isDirectory());

    for (const category of categories) {
        manifest[category] = {};
        const catPath = path.join(BG_DIR, category);
        const subCategories = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());

        for (const sub of subCategories) {
            const subPath = path.join(catPath, sub);
            const files = fs.readdirSync(subPath).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
            
            manifest[category][sub] = files.map(file => `${CDN_BASE}/${encodeURIComponent(category)}/${encodeURIComponent(sub)}/${encodeURIComponent(file)}`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Manifest created successfully at ${OUTPUT_FILE}`);
};

generateManifest();
