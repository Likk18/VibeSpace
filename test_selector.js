import fs from 'fs';

// Quick mock of the selector to test logic locally without Vite
const manifest = JSON.parse(fs.readFileSync('./client/src/utils/backgroundManifest.json', 'utf-8'));

const getBackgroundFromManifest = (categoryStr, subCategoryStr) => {
    return manifest[categoryStr]?.[subCategoryStr] || [];
};

export const selectBackgrounds = (category, sub_category, style, count = 3) => {
    let targetCat = 'solid_colors';
    let targetSub = 'white';

    const catLower = (category || '').toLowerCase();
    const subLower = (sub_category || '').toLowerCase();
    const styleLower = (style || '').toLowerCase();

    const textileKeywords = ['textile', 'bedding', 'pillow', 'duvet', 'towel', 'curtain', 'cushion', 'throw', 'bathmat', 'bedspread'];
    if (textileKeywords.some(kw => catLower.includes(kw) || subLower.includes(kw))) {
        if (subLower.includes('rug')) {
            targetCat = 'floors';
            targetSub = 'hardwood'; // fallback floor
        } else {
            targetCat = 'textures';
            targetSub = 'linen';
        }
    } 
    else if (['mirror', 'wall shelf', 'wall light', 'lighting', 'curtain rod'].some(kw => subLower.includes(kw))) {
        if (subLower.includes('floor lamp')) {
            targetCat = 'floors';
            targetSub = 'hardwood';
        } else {
            targetCat = 'walls';
            targetSub = 'white_minimal';
        }
    }
    else if (['accessory', 'tableware', 'cookware', 'small storage', 'organizer', 'paper', 'cable', 'toy', 'safety'].some(kw => subLower.includes(kw))) {
        if (catLower.includes('kitchen')) {
            targetCat = 'surfaces';
            targetSub = 'kitchen_counter';
        } else if (catLower.includes('bathroom')) {
            targetCat = 'surfaces';
            targetSub = 'bathroom_vanity';
        } else if (catLower.includes('home office')) {
            targetCat = 'surfaces';
            targetSub = 'office_desk';
        } else {
            targetCat = 'surfaces';
            targetSub = 'wood_table';
        }
    }
    else if (catLower.includes('bathroom') || subLower.includes('bathroom')) {
        targetCat = 'floors';
        targetSub = 'tile';
    } else if (catLower.includes('kitchen') || subLower.includes('kitchen')) {
        targetCat = 'floors';
        targetSub = 'tile';
    } 
    else if (['bed', 'sofa', 'chair', 'table', 'desk', 'cabinet', 'wardrobe', 'bookcase', 'drawer', 'shelving'].some(kw => subLower.includes(kw))) {
        if (styleLower === 'scandinavian' || styleLower === 'minimalist') {
            targetCat = 'floors';
            targetSub = 'hardwood';
        } else if (styleLower === 'industrial') {
            targetCat = 'floors';
            targetSub = 'concrete';
        } else {
            targetCat = 'floors';
            targetSub = 'hardwood';
        }
    }
    
    if (styleLower === 'modern_luxury' || styleLower === 'modern-luxury') {
        if (targetCat === 'floors' && targetSub === 'hardwood') targetSub = 'tile';
        if (targetCat === 'surfaces') targetSub = 'marble';
        if (targetCat === 'walls') targetSub = 'wallpaper';
    } else if (styleLower === 'bohemian' || styleLower === 'maximalist') {
        if (targetCat === 'floors' && targetSub === 'hardwood') targetSub = 'carpet';
        if (targetCat === 'textures') targetSub = 'fabric';
    } else if (styleLower === 'traditional') {
        if (targetCat === 'walls') targetSub = 'painted';
    }

    let availableImages = getBackgroundFromManifest(targetCat, targetSub);

    console.log(`Resolved Target -> Cat: ${targetCat}, Sub: ${targetSub}, Available Images: ${availableImages.length}`);

    if (availableImages.length === 0) {
        if (targetCat === 'floors') availableImages = getBackgroundFromManifest('solid_colors', 'light_gray');
        if (availableImages.length === 0 && targetCat === 'walls') availableImages = getBackgroundFromManifest('solid_colors', 'white');
        if (availableImages.length === 0 && targetCat === 'surfaces') availableImages = getBackgroundFromManifest('solid_colors', 'white');
        if (availableImages.length === 0 && targetCat === 'textures') availableImages = getBackgroundFromManifest('solid_colors', 'beige');
        if (availableImages.length === 0 && targetCat === 'room_scenes') availableImages = getBackgroundFromManifest('floors', targetSub);
        
        if (availableImages.length === 0) {
            const allSubs = manifest[targetCat] || {};
            for (const subKey in allSubs) {
                if (allSubs[subKey]?.length > 0) {
                    availableImages = allSubs[subKey];
                    break;
                }
            }
        }
        
        if (availableImages.length === 0) {
            availableImages = getBackgroundFromManifest('solid_colors', 'white');
        }
    }

    const selected = [];
    const usedIndices = new Set();
    
    while(selected.length < count && usedIndices.size < availableImages.length) {
        const idx = Math.floor(Math.random() * availableImages.length);
        if (!usedIndices.has(idx)) {
            usedIndices.add(idx);
            selected.push(availableImages[idx]);
        }
    }

    console.log('Selected backgrounds:', selected);
    return selected;
};

selectBackgrounds('Wardrobe & Storage', 'Freestanding Wardrobes', 'minimalist');
