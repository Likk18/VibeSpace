const MANIFEST_URL = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/src/utils/backgroundManifest.json';
let cachedManifest = null;

const getManifest = async () => {
    if (cachedManifest) return cachedManifest;

    // Fetch from jsDelivr (in-memory cache only, no IndexedDB)
    try {
        const response = await fetch(MANIFEST_URL);
        const manifest = await response.json();
        cachedManifest = manifest;
        return manifest;
    } catch (error) {
        console.error('[backgroundSelector] Failed to fetch manifest from jsDelivr:', error);
        // Fallback to empty manifest to avoid crashes
        return {};
    }
};

const getRandomFromList = (list) => {
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
};

const getBackgroundFromManifest = (manifest, categoryStr, subCategoryStr) => {
    return manifest[categoryStr]?.[subCategoryStr] || [];
};

export const selectBackgrounds = async (category, sub_category, style, count = 3) => {
    const manifest = await getManifest();
    // Determine target folder based on exact User Rules mapping
    let targetCat = 'solid_colors';
    let targetSub = 'white';

    const catLower = (category || '').toLowerCase();
    const subLower = (sub_category || '').toLowerCase();
    const styleLower = (style || '').toLowerCase();

    // Step 1: Check for Textile Keywords
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
    // Step 2: Check for Wall-Mounted Keywords
    else if (['mirror', 'wall shelf', 'wall light', 'lighting', 'curtain rod'].some(kw => subLower.includes(kw) || catLower.includes(kw))) {
        if (subLower.includes('floor lamp') || catLower.includes('floor lamp')) {
            targetCat = 'floors';
            targetSub = 'hardwood';
        } else {
            targetCat = 'walls';
            targetSub = 'white_minimal';
        }
    }
    // Step 3: Check for Small Accessory Keywords
    else if (['accessory', 'tableware', 'cookware', 'small storage', 'organizer', 'paper', 'cable', 'toy', 'safety', 'decoration'].some(kw => subLower.includes(kw) || catLower.includes(kw))) {
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
    // Step 4: Category-specific Lookup
    else if (catLower.includes('bathroom') || subLower.includes('bathroom')) {
        targetCat = 'floors';
        targetSub = 'tile';
    } else if (catLower.includes('kitchen') || subLower.includes('kitchen')) {
        targetCat = 'floors';
        targetSub = 'tile';
    } 
    // Step 5: Large furniture Keywords
    else if (['bed', 'sofa', 'chair', 'table', 'desk', 'cabinet', 'wardrobe', 'wordrobe', 'bookcase', 'drawer', 'shelving', 'storage'].some(kw => subLower.includes(kw) || catLower.includes(kw))) {
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
    
    // Style-Based Refinements (Secondary Rules overriders)
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

    // Attempt to grab images from the target folder
    let availableImages = getBackgroundFromManifest(manifest, targetCat, targetSub);

    // Explicit Fallback Handling sequence from Prompt
    if (availableImages.length === 0) {
        if (targetCat === 'floors') availableImages = getBackgroundFromManifest(manifest, 'solid_colors', 'light_gray');
        if (availableImages.length === 0 && targetCat === 'walls') availableImages = getBackgroundFromManifest(manifest, 'solid_colors', 'white');
        if (availableImages.length === 0 && targetCat === 'surfaces') availableImages = getBackgroundFromManifest(manifest, 'solid_colors', 'white');
        if (availableImages.length === 0 && targetCat === 'textures') availableImages = getBackgroundFromManifest(manifest, 'solid_colors', 'beige');
        if (availableImages.length === 0 && targetCat === 'room_scenes') availableImages = getBackgroundFromManifest(manifest, 'floors', targetSub);
        
        // Next fallback: try any subfolder in category
        if (availableImages.length === 0) {
            const allSubs = manifest[targetCat] || {};
            for (const subKey in allSubs) {
                if (allSubs[subKey]?.length > 0) {
                    availableImages = allSubs[subKey];
                    break;
                }
            }
        }
        
        // Ultimate fallback
        if (availableImages.length === 0) {
            availableImages = getBackgroundFromManifest(manifest, 'solid_colors', 'white');
        }
    }

    // Now return `count` randomly selected unique backgrounds
    const selected = [];
    const usedIndices = new Set();
    
    while(selected.length < count && usedIndices.size < availableImages.length) {
        const idx = Math.floor(Math.random() * availableImages.length);
        if (!usedIndices.has(idx)) {
            usedIndices.add(idx);
            selected.push(availableImages[idx]);
        }
    }

    return selected;
};
