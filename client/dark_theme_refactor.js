import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { from: /\bbg-white\b/g, to: 'bg-surface' },
    { from: /\btext-dark\b/g, to: 'text-light' },
    { from: /\btext-gray-900\b/g, to: 'text-gray-100' },
    { from: /\btext-gray-800\b/g, to: 'text-gray-200' },
    { from: /\btext-gray-700\b/g, to: 'text-gray-300' },
    { from: /\btext-gray-600\b/g, to: 'text-gray-400' },
    { from: /\btext-gray-500\b/g, to: 'text-muted' },
    { from: /\bbg-gray-50\b/g, to: 'bg-background' },
    { from: /\bbg-gray-100\b/g, to: 'bg-surface' },
    { from: /\bborder-gray-200\b/g, to: 'border-white/10' },
    { from: /\bborder-gray-300\b/g, to: 'border-white/20' },
    { from: /\bshadow-sm\b/g, to: 'shadow-lg shadow-black/20' }
];

walk('d:/VibeSpace/client/src', (filePath) => {
    if (filePath.match(/\.jsx?$/)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        for (let rule of replacements) {
            content = content.replace(rule.from, rule.to);
        }
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
