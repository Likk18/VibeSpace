import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rmbgDir = path.join(process.cwd(), 'client', 'assets', 'IKEA-RMBG');
const bgDir = path.join(process.cwd(), 'client', 'assets', 'Backgrounds');

function getFiles(dirPath) {
    let results = [];
    if (!fs.existsSync(dirPath)) return results;
    
    const list = fs.readdirSync(dirPath);
    for (const file of list) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (file.match(/\.(png|jpg|jpeg)$/i)) {
            // Get relative path for Git
            results.push(path.relative(process.cwd(), fullPath).replace(/\\/g, '/'));
        }
    }
    return results;
}

const allImages = [...getFiles(rmbgDir), ...getFiles(bgDir)];
const total = allImages.length;
const batchSize = 1000;

console.log(`Found ${total} images to push.`);

execSync('git config --global http.postBuffer 524288000', { stdio: 'inherit' });

for (let i = 0; i < total; i += batchSize) {
    const batch = allImages.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);
    
    console.log(`\nProcessing Batch ${batchNum} of ${totalBatches} (${batch.length} files)...`);
    
    // Add files
    for (const file of batch) {
        try {
            execSync(`git add "${file}"`);
        } catch (e) {
            console.error(`Failed to add ${file}`);
        }
    }
    
    try {
        console.log(`Committing Batch ${batchNum}...`);
        execSync(`git commit -m "chore(assets): add images batch ${batchNum}/${totalBatches}"`);
        
        console.log(`Pushing Batch ${batchNum}...`);
        execSync('git push origin main', { stdio: 'inherit' });
    } catch (e) {
        console.error(`Status for Batch ${batchNum}:`, e.message);
        // Might be nothing to commit if already added
    }
}

console.log('\nAll batches completed successfully!');
